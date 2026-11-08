import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";
import { createClient } from "@/lib/supabase/server";

// POST /api/notices  { fire_at: "2026-11-05T20:30:00.000Z" }
// Programa el aviso único de la persona: cancela el anterior activo y crea el
// disparo en QStash, que llamará a /api/alert a la hora indicada.
export const runtime = "nodejs";

const MIN_LEAD_MS = 60 * 1000; // al menos 1 minuto en el futuro
const MAX_LEAD_MS = 30 * 24 * 60 * 60 * 1000; // hasta 30 días

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
  }

  let fireAt: Date;
  try {
    const body = (await req.json()) as { fire_at?: string };
    fireAt = new Date(body.fire_at ?? "");
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }
  if (Number.isNaN(fireAt.getTime())) {
    return NextResponse.json({ ok: false, error: "Fecha inválida" }, { status: 400 });
  }
  const lead = fireAt.getTime() - Date.now();
  if (lead < MIN_LEAD_MS || lead > MAX_LEAD_MS) {
    return NextResponse.json(
      { ok: false, error: "La hora tiene que ser entre 1 minuto y 30 días a partir de ahora" },
      { status: 400 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const token = process.env.QSTASH_TOKEN;
  if (!appUrl || !token) {
    return NextResponse.json({ ok: false, error: "Faltan NEXT_PUBLIC_APP_URL o QSTASH_TOKEN" }, { status: 500 });
  }
  // QSTASH_URL es el endpoint de la región de tu cuenta (ej. https://qstash-us-east-1.upstash.io).
  const qstash = new Client({ token, baseUrl: process.env.QSTASH_URL });

  // 1. Cancelar el aviso activo anterior (un solo aviso activo por vez).
  const { data: previous } = await supabase
    .from("notices")
    .select("id, qstash_message_id")
    .eq("issuer_id", user.id)
    .eq("state", "active");
  for (const p of previous ?? []) {
    if (p.qstash_message_id) {
      try {
        await qstash.messages.delete(p.qstash_message_id);
      } catch {
        // Si ya se disparó o no existe, seguimos: el endpoint ignora avisos no activos.
      }
    }
    await supabase
      .from("notices")
      .update({ state: "off", qstash_message_id: null, updated_at: new Date().toISOString() })
      .eq("id", p.id);
  }

  // 2. Crear el aviso activo.
  const { data: notice, error: insertErr } = await supabase
    .from("notices")
    .insert({ issuer_id: user.id, fire_at: fireAt.toISOString(), state: "active" })
    .select("id")
    .single();
  if (insertErr || !notice) {
    return NextResponse.json({ ok: false, error: "No se pudo guardar el aviso" }, { status: 500 });
  }

  // 3. Programar el disparo en QStash.
  try {
    const res = await qstash.publishJSON({
      url: `${appUrl}/api/alert`,
      body: { notice_id: notice.id },
      notBefore: Math.floor(fireAt.getTime() / 1000),
    });
    const messageId = "messageId" in res ? res.messageId : null;
    await supabase.from("notices").update({ qstash_message_id: messageId }).eq("id", notice.id);
  } catch (e) {
    // Si QStash falla, el aviso no puede quedar activo sin disparo.
    await supabase.from("notices").update({ state: "off" }).eq("id", notice.id);
    const detail = e instanceof Error ? e.message : "Error desconocido";
    console.error("[notices] QStash publish falló:", detail);
    return NextResponse.json({ ok: false, error: `No se pudo programar el aviso: ${detail}` }, { status: 502 });
  }

  return NextResponse.json({ ok: true, id: notice.id, fire_at: fireAt.toISOString() });
}
