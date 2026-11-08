import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/push/subscribe  { endpoint, keys: { p256dh, auth } }
// Guarda el dispositivo de la persona para recibir notificaciones push.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { endpoint?: string; keys?: { p256dh?: string; auth?: string } }
    | null;
  const endpoint = body?.endpoint;
  const p256dh = body?.keys?.p256dh;
  const auth = body?.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ ok: false, error: "Suscripción inválida" }, { status: 400 });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      { issuer_id: user.id, endpoint, p256dh, auth },
      { onConflict: "endpoint" }
    );
  if (error) {
    return NextResponse.json({ ok: false, error: "No se pudo guardar la suscripción" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
