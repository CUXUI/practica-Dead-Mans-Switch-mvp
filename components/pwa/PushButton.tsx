"use client";

import { useState } from "react";

// Convierte la clave VAPID pública (base64url) al formato que pide pushManager.subscribe.
function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export default function PushButton() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function activate() {
    setStatus(null);
    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!key) return setStatus("Falta la clave pública de notificaciones.");
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return setStatus("Este navegador no permite notificaciones. En iPhone, instalá la app en la pantalla de inicio.");
    }

    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setLoading(false);
        return setStatus("Sin permiso no podemos avisarte al celular.");
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
      });
      const json = sub.toJSON();

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      setLoading(false);
      setStatus(data.ok ? "Notificaciones activadas en este dispositivo." : data.error ?? "No se pudo activar.");
    } catch {
      setLoading(false);
      setStatus("No se pudo activar las notificaciones.");
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={activate}
        disabled={loading}
        className="min-h-11 w-full rounded-lg border border-border px-4 py-2 font-medium disabled:opacity-60"
      >
        {loading ? "Activando…" : "Activar notificaciones en este celular"}
      </button>
      {status && <p role="status" className="text-sm text-text-muted">{status}</p>}
    </div>
  );
}
