import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clienteAdmin } from "@/lib/supabase/admin";
import { getBrand } from "@/lib/brand";
import { sendEmail } from "@/lib/email";
import { textosCuenta } from "@/components/cuenta/textos";
import { rellenar } from "@/components/aviso/textos";
import { cancelarProgramado } from "@/app/aviso/_datos/qstash";

// POST /api/cuenta/borrar
// E8: quien emite borra su cuenta y sus datos. Corre solo en el servidor y solo para la persona con
// sesión: nadie puede borrar la cuenta de otra. Borrar al usuario de la autenticación arrastra todo lo
// suyo (perfil, avisos, contactos, confirmaciones, alertas, dispositivos) porque las tablas se
// borran en cascada. Solo responde ok cuando el servidor borró la cuenta (E1).
//
// La clave de servidor (service_role) se usa solo a través de clienteAdmin() (lib/supabase/admin.ts),
// que es la pieza que controla el núcleo. Esta ruta no arma su propio cliente con la clave.
export const runtime = "nodejs";

const escapar = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
  }

  const marca = getBrand();
  const t = textosCuenta(marca.variant);

  const admin = clienteAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: t.errorGenerico }, { status: 500 });
  }

  // 1. Con una alerta en curso no se borra: los contactos ya fueron avisados y tienen que poder verla cerrarse.
  //    PREGUNTA ABIERTA de producto: el PRD no dice qué pasa si se borra la cuenta en plena alerta.
  const { data: avisos, error: avisosErr } = await supabase.from("notices").select("id, state, qstash_message_id").eq("issuer_id", user.id);
  if (avisosErr) {
    return NextResponse.json({ ok: false, error: t.errorGenerico }, { status: 500 });
  }
  if ((avisos ?? []).some((a) => a.state === "alert")) {
    return NextResponse.json({ ok: false, error: t.alertaEnCurso }, { status: 409 });
  }

  // 2. Antes de borrar, guardar a quién avisar: después ya no habrá filas.
  const [{ data: perfil }, { data: contactos, error: contactosErr }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase.from("contacts").select("name, email").eq("issuer_id", user.id).eq("status", "accepted"),
  ]);
  if (contactosErr) {
    return NextResponse.json({ ok: false, error: t.errorGenerico }, { status: 500 });
  }
  const nombre = perfil?.full_name?.trim() || "Una persona";

  // 3. Borrar la cuenta. Si falla, no se avisa a nadie.
  const { error: borrarErr } = await admin.auth.admin.deleteUser(user.id);
  if (borrarErr) {
    console.error("[cuenta] no se pudo borrar:", borrarErr.message);
    return NextResponse.json({ ok: false, error: t.errorGenerico }, { status: 500 });
  }

  // 4. Ya borrada: se apagan los disparos pendientes y se avisa a los contactos. Es mejor esfuerzo:
  //    si algo de esto falla, la cuenta ya no existe y no se le pide nada a la persona.
  await Promise.allSettled((avisos ?? []).map((a) => cancelarProgramado(a.qstash_message_id)));

  const valores = { nombre: escapar(nombre), app: escapar(marca.name) };
  const resultados = await Promise.allSettled(
    (contactos ?? []).map((c) =>
      sendEmail({
        to: c.email,
        subject: rellenar(t.correoAsunto, { nombre, app: marca.name }),
        html: `<p>${rellenar(t.correoCuerpo1, valores)}</p><p>${escapar(t.correoCuerpo2)}</p>`,
      })
    )
  );
  const fallidos = resultados.filter((r) => r.status === "rejected").length;
  if (fallidos > 0) console.error(`[cuenta] ${fallidos} aviso(s) de baja no salieron`);

  return NextResponse.json({ ok: true, avisados: (contactos ?? []).length - fallidos });
}
