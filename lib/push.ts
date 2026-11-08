import * as webpush from "web-push";
import type { PushSubscriptionJSON, WebPushError } from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";

// Solo servidor. Envía una notificación push a todos los dispositivos de una persona.
// Los endpoints que ya no existen (404/410) se borran de la base.
export async function sendPushToUser(
  admin: SupabaseClient,
  userId: string,
  payload: { title: string; body: string; url: string }
) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return { sent: 0, reason: "Faltan claves VAPID" };

  webpush.setVapidDetails(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://localhost",
    publicKey,
    privateKey
  );

  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("issuer_id", userId);

  let sent = 0;
  for (const s of subs ?? []) {
    const sub: PushSubscriptionJSON = {
      endpoint: s.endpoint,
      keys: { p256dh: s.p256dh, auth: s.auth },
    };
    try {
      await webpush.sendNotification(sub, JSON.stringify(payload), { TTL: 3600 });
      sent++;
    } catch (e) {
      const status = (e as WebPushError).statusCode;
      if (status === 404 || status === 410) {
        await admin.from("push_subscriptions").delete().eq("id", s.id);
      }
    }
  }
  return { sent };
}
