"use client";

import { useEffect, useRef, useState } from "react";
import { Badge, EnlaceBoton, Pantalla, Progreso, Tarjeta, clases } from "@/components/emisor/ui";
import type { TextosAlta } from "./textos";

// Paso 1 del onboarding. Usa el mismo endpoint que el PushButton del núcleo (/api/push/subscribe).
// Solo muestra "Notificaciones activas" cuando el servidor guardó la suscripción.

type Fase = "inicio" | "activando" | "activas" | "no-activo";

const SIGUIENTE = "/contactos/nuevo";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export default function ActivarNotificaciones({ t }: { t: TextosAlta["notificaciones"] }) {
  const [fase, setFase] = useState<Fase>("inicio");
  const [detalle, setDetalle] = useState<string | null>(null);
  const titulo = useRef<HTMLHeadingElement>(null);

  // Al cambiar de estado, el foco va al título nuevo para el lector de pantalla.
  useEffect(() => {
    if (fase !== "inicio" && fase !== "activando") titulo.current?.focus();
  }, [fase]);

  async function activar() {
    setDetalle(null);
    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window) || !key) {
      setDetalle(t.noCompatible);
      return setFase("no-activo");
    }
    setFase("activando");
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") {
        if (permiso === "denied") setDetalle(t.bloqueado);
        return setFase("no-activo");
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
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });
      const data = (await res.json().catch(() => ({ ok: false }))) as { ok: boolean };
      if (!data.ok) throw new Error("subscribe");
      setFase("activas");
    } catch {
      setDetalle(t.errorGuardar);
      setFase("no-activo");
    }
  }

  const cabecera = <Progreso actual={1} total={3} siguiente={t.siguiente} />;

  if (fase === "activas") {
    return (
      <Pantalla pie={<EnlaceBoton href={SIGUIENTE}>{t.continuar}</EnlaceBoton>}>
        {cabecera}
        <Tarjeta>
          <Badge>{t.activasBadge}</Badge>
          <h1 ref={titulo} tabIndex={-1} className="text-xl font-semibold">
            {t.activasTitulo}
          </h1>
          <p className="text-text-muted">{t.activasTexto}</p>
        </Tarjeta>
      </Pantalla>
    );
  }

  if (fase === "no-activo") {
    return (
      <Pantalla
        pie={
          <>
            <button type="button" onClick={activar} className={clases.principal}>
              {t.reintentar}
            </button>
            <EnlaceBoton href={SIGUIENTE} tipo="secundario">
              {t.continuarSin}
            </EnlaceBoton>
          </>
        }
      >
        {cabecera}
        <Tarjeta>
          <h1 ref={titulo} tabIndex={-1} className="text-xl font-semibold">
            {t.noTitulo}
          </h1>
          <p>{t.noTexto}</p>
          {detalle && (
            <p role="status" className="text-sm font-medium">
              {detalle}
            </p>
          )}
        </Tarjeta>
        <p className="text-sm text-text-muted">{t.noNota}</p>
      </Pantalla>
    );
  }

  return (
    <Pantalla
      pie={
        <>
          <button type="button" onClick={activar} disabled={fase === "activando"} className={clases.principal}>
            {fase === "activando" ? t.activando : t.activar}
          </button>
          <button
            type="button"
            onClick={() => setFase("no-activo")}
            disabled={fase === "activando"}
            className={clases.secundario}
          >
            {t.ahoraNo}
          </button>
        </>
      }
    >
      {cabecera}
      <Tarjeta>
        <h1 className="text-xl font-semibold">{t.titulo}</h1>
        <p className="text-text-muted">{t.texto}</p>
      </Tarjeta>
    </Pantalla>
  );
}
