import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { avisarAContacto, contactosDelAviso, firmaValida, minutosEscalado, programarLlamada } from "@/lib/motor";

// POST /api/alert/siguiente  { alert_id, posicion }
// Avisa al contacto que sigue en la lista (S2). Se detiene si la alerta ya no está abierta
// o si alguien abrió el enlace (visto frena el paso al siguiente, R3).
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  if (!(await firmaValida(req, body))) {
    return NextResponse.json({ ok: false, error: "Firma inválida" }, { status: 401 });
  }
  const { alert_id: alertaId, posicion } = (JSON.parse(body) as { alert_id?: string; posicion?: number }) ?? {};
  if (!alertaId || !posicion) {
    return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 });
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

  // Si alguien ya abrió el enlace, no se sigue avisando.
  const { count: vistas } = await admin
    .from("alert_views")
    .select("id", { count: "exact", head: true })
    .eq("alert_id", alertaId);
  if ((vistas ?? 0) > 0) {
    return NextResponse.json({ ok: true, skipped: "visto" });
  }

  const contactos = await contactosDelAviso(admin, alerta.notice_id);
  const contacto = contactos[posicion - 1];
  if (!contacto) {
    return NextResponse.json({ ok: true, skipped: "sin mas contactos" });
  }

  const { data: perfil } = await admin.from("profiles").select("full_name").eq("id", alerta.issuer_id).maybeSingle();
  const quien = perfil?.full_name?.trim() || "Una persona";
  await avisarAContacto(admin, alertaId, contacto, quien);

  await admin.from("alerts").update({ last_stage: posicion }).eq("id", alertaId);

  if (posicion < contactos.length) {
    const { data: aviso } = await admin.from("notices").select("escalation_minutes").eq("id", alerta.notice_id).maybeSingle();
    const proximo = new Date(Date.now() + minutosEscalado(aviso?.escalation_minutes) * 60 * 1000);
    await programarLlamada("/api/alert/siguiente", { alert_id: alertaId, posicion: posicion + 1 }, proximo).catch(
      (e) => console.error("[siguiente] no se pudo programar el próximo contacto:", e)
    );
  }

  return NextResponse.json({ ok: true, avisado: contacto.id });
}
