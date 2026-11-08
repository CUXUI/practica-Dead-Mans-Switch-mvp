import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";
import { getBrand } from "@/lib/brand";
import { sendPushToUser } from "@/lib/push";

// POST /api/alert
// Lo llama QStash a la hora programada. No hay sesión de usuario: por eso usa la
// service_role (solo servidor) y verifica la firma de QStash antes de hacer nada.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();

  const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY ?? "",
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY ?? "",
  });
  try {
    await receiver.verify({ signature: req.headers.get("upstash-signature") ?? "", body });
  } catch {
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
  const when = new Date(notice.fire_at).toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
  });

  try {
    await sendEmail({
      to,
      subject: `${brand.name}: se disparó tu aviso`,
      html: `<p>Tu aviso programado para las <strong>${when}</strong> se disparó.</p>
             <p>Si estás bien, entrá a la app y confirmalo.</p>`,
    });
  } catch (e) {
    // 5xx para que QStash reintente.
    const message = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }

  const { error: updateErr } = await admin
    .from("notices")
    .update({ state: "alert", updated_at: new Date().toISOString() })
    .eq("id", notice.id)
    .eq("state", "active");
  if (updateErr) {
    return NextResponse.json({ ok: false, error: "Correo enviado, pero no se actualizó el estado" }, { status: 500 });
  }

  // Push al celular (canal principal). Si falla, el correo ya salió: no reintentamos por esto.
  const push = await sendPushToUser(admin, notice.issuer_id, {
    title: brand.name,
    body: "Se disparó tu aviso. Entrá a la app para confirmar que estás bien.",
    url: "/home",
  }).catch(() => ({ sent: 0 }));

  return NextResponse.json({ ok: true, push_sent: push.sent });
}
