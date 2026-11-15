"use client";

// Suscripción a notificaciones push del flujo 1. Misma lógica que components/pwa/PushButton
// (núcleo), separada aquí para poder mostrar los estados del onboarding sin modificar ese botón.
// Guarda la suscripción con el endpoint del núcleo /api/push/subscribe.

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export function pushDisponible() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

export function permisoActual(): NotificationPermission | "no-disponible" {
  return pushDisponible() ? Notification.permission : "no-disponible";
}

// Crea (o reutiliza) la suscripción del dispositivo y la guarda. Devuelve true si quedó guardada.
export async function guardarSuscripcion(): Promise<boolean> {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key || !pushDisponible()) return false;
  const reg = await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
    }));
  const json = sub.toJSON();
  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
  });
  const data = (await res.json()) as { ok: boolean };
  return data.ok;
}

// Destino después de iniciar sesión: si en este dispositivo nunca se pidió el permiso,
// va al paso de notificaciones (decisión de diseño de iPhone, 15 nov 2026); si no, a Home.
export function destinoTrasIngreso() {
  try {
    if (permisoActual() === "default") return "/alta/notificaciones";
  } catch {
    // Si el navegador falla al leer el permiso, se sigue como siempre.
  }
  return "/home";
}
