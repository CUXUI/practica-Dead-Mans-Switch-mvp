import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";
import { getBrand } from "@/lib/brand";
import { sendPushToUser } from "@/lib/push";
import {
  MINUTOS_ENTRE_CONTACTOS,
  HORAS_VENCIMIENTO,
  appUrl,
  avisarAContacto,
  contactosDelAviso,
  firmaValida,
  programarLlamada,
} from "@/lib/motor";

// POST /api/alert
// Lo llama QStash al acabar el tiempo de gracia, si nadie confirmó (E1, S1).
// Abre la alerta (estado "alert"), avisa al primer contacto, programa el siguiente y el vencimiento (S2, S5).
// No hay sesión de usuario: usa la service_role (solo servidor) y verifica la firma de QStash.
export const runtime = "nodejs";

const MS_HORA = 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  const body = await req.text();
  if (!(await firmaValida(req, body))) {
    return NextResponse.json({ ok: false, error: "Firma inválida" }, { status: 401 });
  }

  let noticeId: string | undefined;
  try {
    noticeId = (JSON.parse(body) as { notice_id?: string }).notice_id;
  } catch {
    noticeId = undefined;
  }
  if (!noticeId) {
    return NextResponse.json({ ok: false, error: "Falta notice_id" }, { status: 400 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ ok: false, error: "Falta SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: notice, error: noticeErr } = await admin
    .from("notices")
    .select("id, issuer_id, state, fire_at")
    .eq("id", noticeId)
    .maybeSingle();
  if (noticeErr) {
    return NextResponse.json({ ok: false, error: "Error al leer el aviso" }, { status: 500 });
  }
  if (!notice) {
    return NextResponse.json({ ok: false, error: "Aviso no encontrado" }, { status: 404 });
  }
  // Si ya no está activo (apagado, cancelado o ya disparado), no hacer nada.
  if (notice.state !== "active") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { data: userData } = await admin.auth.admin.getUserById(notice.issuer_id);
  const to = userData?.user?.email;
  if (!to) {
    return NextResponse.json({ ok: false, error: "La persona no tiene correo" }, { status: 500 });
  }
  const brand = getBrand();

  // 1. Abrir la alerta: el aviso pasa a "alert". Solo una vez (filtro por estado).
  const ahora = new Date();
  const { error: updateErr, data: abierto } = await admin
    .from("notices")
    .update({ state: "alert", updated_at: ahora.toISOString() })
    .eq("id", notice.id)
    .eq("state", "active")
    .select("id");
  if (updateErr) {
    return NextResponse.json({ ok: false, error: "No se pudo abrir la alerta" }, { status: 500 });
  }
  if (!abierto || abierto.length === 0) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  // 2. Fila de la alerta (E7, cancelación E6, vencimiento S5).
  const { data: alertaFila, error: alertaErr } = await admin
    .from("alerts")
    .insert({
      notice_id: notice.id,
      issuer_id: notice.issuer_id,
      started_at: ahora.toISOString(),
      expires_at: new Date(ahora.getTime() + HORAS_VENCIMIENTO * MS_HORA).toISOString(),
      outcome: "open",
      last_stage: 1,
    })
    .select("id")
    .single();
  if (alertaErr || !alertaFila) {
    return NextResponse.json({ ok: false, error: "No se pudo registrar la alerta" }, { status: 500 });
  }
  const alertaId = alertaFila.id as string;

  // 3. Destinatarios: los contactos aceptados, en orden. Se marcan como avisados al enviar.
  const contactos = await contactosDelAviso(admin, notice.id);
  if (contactos.length > 0) {
    const { error: destErr } = await admin
      .from("alert_recipients")
      .insert(contactos.map((c) => ({ alert_id: alertaId, contact_id: c.id })));
    if (destErr) console.error("[alert] no se pudieron registrar los destinatarios:", destErr.message);
  }

  // 4. Avisar a quien emite (correo y push). Si falla, la alerta sigue: el correo es respaldo.
  const quien = (await admin.from("profiles").select("full_name").eq("id", notice.issuer_id).maybeSingle()).data
    ?.full_name?.trim() || "Tu aviso";
  // Enlace directo a Inicio, donde está el botón de cancelar (mantener 2 s). No cancela nada por sí solo:
  // cancelar sigue siendo una acción deliberada dentro de la app. Si no hay sesión, pide iniciarla y vuelve a Inicio.
  const base = appUrl()?.replace(/\/$/, "");
  const enlaceCancelar = base ? `${base}/home` : null;
  await sendEmail({
    to,
    subject: `${brand.name}: se disparó tu aviso`,
    html: `<p>Tu aviso se disparó porque no confirmaste que estás bien.</p>
           <p>Estamos avisando a tus contactos de confianza. Si estás bien, entra a la app y cancela la alerta.</p>
           ${
             enlaceCancelar
               ? `<p><a href="${enlaceCancelar}">Abrir la app y cancelar la alerta</a></p>
           <p>En Inicio, mantén presionado el botón «Estoy bien, cancelar alerta» durante 2 segundos.</p>`
               : ""
           }`,
  }).catch((e) => console.error("[alert] correo a quien emite falló:", e));
  await sendPushToUser(admin, notice.issuer_id, {
    title: brand.name,
    body: "Se disparó tu aviso. Entra a la app para cancelar la alerta si estás bien.",
    url: "/home",
  }).catch(() => ({ sent: 0 }));

  // 5. Primer contacto ahora. El resto, de a uno, cada MINUTOS_ENTRE_CONTACTOS (S2).
  if (contactos.length > 0) {
    await avisarAContacto(admin, alertaId, contactos[0], quien);
  }
  if (contactos.length > 1) {
    const proximo = new Date(ahora.getTime() + MINUTOS_ENTRE_CONTACTOS * 60 * 1000);
    await programarLlamada("/api/alert/siguiente", { alert_id: alertaId, posicion: 2 }, proximo).catch((e) =>
      console.error("[alert] no se pudo programar el siguiente contacto:", e)
    );
  }

  // 6. Vencimiento por tiempo si nadie la cierra (S5).
  await programarLlamada(
    "/api/alert/vencer",
    { alert_id: alertaId },
    new Date(ahora.getTime() + HORAS_VENCIMIENTO * MS_HORA)
  ).catch((e) => console.error("[alert] no se pudo programar el vencimiento:", e));

  return NextResponse.json({ ok: true, contactos_avisados: contactos.length > 0 ? 1 : 0 });
}
