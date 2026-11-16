import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";
import { getBrand } from "@/lib/brand";
import { avisarAContacto, contactosDelAviso, firmaValida } from "@/lib/motor";

// POST /api/alert/vencer  { alert_id }
// S5: si nadie cerró la alerta, vence por tiempo. Vencer no es cerrar: se avisa a quien emite y a
// todos los contactos, y la alerta queda "sin resolver" en el historial.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  if (!(await firmaValida(req, body))) {
    return NextResponse.json({ ok: false, error: "Firma inválida" }, { status: 401 });
  }
  const { alert_id: alertaId } = (JSON.parse(body) as { alert_id?: string }) ?? {};
  if (!alertaId) {
    return NextResponse.json({ ok: false, error: "Falta alert_id" }, { status: 400 });
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  const { data: alerta } = await admin
    .from("alerts")
    .select("id, notice_id, issuer_id, outcome")
    .eq("id", alertaId)
    .maybeSingle();
  if (!alerta || alerta.outcome !== "open") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Cerrar la alerta como "sin resolver". El filtro por outcome evita dos vencimientos.
  const ahora = new Date().toISOString();
  const { data: cerrada } = await admin
    .from("alerts")
    .update({ outcome: "unresolved", closed_at: ahora })
    .eq("id", alertaId)
    .eq("outcome", "open")
    .select("id");
  if (!cerrada || cerrada.length === 0) {
    return NextResponse.json({ ok: true, skipped: true });
  }
  await admin.from("notices").update({ state: "off", updated_at: ahora }).eq("id", alerta.notice_id).eq("state", "alert");

  const marca = getBrand();
  const { data: userData } = await admin.auth.admin.getUserById(alerta.issuer_id);
  const correo = userData?.user?.email;
  if (correo) {
    await sendEmail({
      to: correo,
      subject: `${marca.name}: tu alerta venció sin resolver`,
      html: `<p>Tu alerta venció sin que nadie la cerrara. Quedó registrada como <strong>sin resolver</strong> en tu historial.</p>
             <p>Si estás bien, entrá a la app y configurá un nuevo aviso.</p>`,
    }).catch((e) => console.error("[vencer] correo a quien emite falló:", e));
  }

  const { data: perfil } = await admin.from("profiles").select("full_name").eq("id", alerta.issuer_id).maybeSingle();
  const quien = perfil?.full_name?.trim() || "Una persona";
  const contactos = await contactosDelAviso(admin, alerta.notice_id);
  for (const c of contactos) {
    await avisarAContacto(admin, alertaId, c, quien);
  }

  return NextResponse.json({ ok: true, contactos_avisados: contactos.length });
}
