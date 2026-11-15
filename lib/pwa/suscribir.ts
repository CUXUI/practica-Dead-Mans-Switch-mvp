// Solo navegador. Crea (o reutiliza) la suscripción push de este dispositivo y la guarda en el servidor.
// Nunca borra una suscripción que ya existe: si FCM falla un rato, la buena se conserva.

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export type ResultadoSuscripcion = { ok: true } | { ok: false; paso: string; error: string };

// "reintentos": FCM a veces tarda o falla un instante (red, ahorro de batería): se vuelve a intentar con espera.
export async function suscribirYGuardar(reintentos = 2): Promise<ResultadoSuscripcion> {
  let paso = "clave";
  try {
    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!key) return { ok: false, paso, error: "Falta la clave pública" };

    paso = "service worker";
    const reg = await navigator.serviceWorker.ready;

    paso = "suscripción";
    let sub = await reg.pushManager.getSubscription();
    for (let i = 0; !sub; i++) {
      try {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
        });
      } catch (e) {
        if (i >= reintentos) throw e;
        await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
      }
    }

    paso = "guardar";
    const json = sub.toJSON();
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
    });
    const data = (await res.json().catch(() => ({ ok: false }))) as { ok: boolean };
    if (!data.ok) throw new Error("El servidor no guardó la suscripción");
    return { ok: true };
  } catch (e) {
    return { ok: false, paso, error: e instanceof Error ? `${e.name}: ${e.message}` : "error desconocido" };
  }
}
