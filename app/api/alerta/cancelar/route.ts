import { NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// POST /api/alerta/cancelar
// E6: quien emite cancela una falsa alarma. Cierra el aviso en alerta y deja registrada su
// confirmación. Todo corre en el servidor y con la sesión de quien emite (RLS): nadie puede
// cancelar la alerta de otra persona. Responde ok solo si el servidor guardó el cambio.
export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
  }

  // 1. Cerrar el aviso en alerta. El filtro por estado hace que repetir la petición no
  //    registre dos cancelaciones.
  const { data: cerrados, error: updateErr } = await supabase
    .from("notices")
    .update({ state: "off", qstash_message_id: null, updated_at: new Date().toISOString() })
    .eq("issuer_id", user.id)
    .eq("state", "alert")
    .select("id");
  if (updateErr) {
    return NextResponse.json({ ok: false, error: "No se pudo cancelar la alerta." }, { status: 500 });
  }
  if (!cerrados || cerrados.length === 0) {
    return NextResponse.json({ ok: false, error: "No hay una alerta en curso." }, { status: 409 });
  }
  const noticeId = cerrados[0].id as string;

  // 2. Si el motor ya registró el disparo en `alerts`, cerrarlo. Las escrituras de esa tabla
  //    son solo del servidor (service_role). Hoy /api/alert no crea esa fila; cuando lo haga,
  //    queda cerrada aquí sin tocar nada más.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
      auth: { persistSession: false },
    });
    const { error: alertErr } = await admin
      .from("alerts")
      .update({ outcome: "closed", closed_at: new Date().toISOString() })
      .eq("notice_id", noticeId)
      .eq("outcome", "open");
    if (alertErr) console.error("No se pudo cerrar la fila de alerts:", alertErr.message);
  }

  // 3. Registrar la confirmación (E1, E6: cancelar es confirmar que está bien).
  const { error: confirmErr } = await supabase
    .from("confirmations")
    .insert({ issuer_id: user.id, notice_id: noticeId, source: "app" });
  if (confirmErr) {
    return NextResponse.json(
      { ok: false, error: "La alerta se canceló, pero no se pudo guardar en tu historial." },
      { status: 500 }
    );
  }

  // R7 (avisar a los contactos que la alerta se cerró) lo resuelve el motor del núcleo.
  return NextResponse.json({ ok: true });
}
