"use client";

import { useEffect, useState } from "react";
import { detectarPlataforma, estaInstalada } from "@/components/alta/instalacion";
import { marcarNotificacionesApagadas, notificacionesApagadasAqui } from "@/lib/pwa/optout";
import { suscribirYGuardar } from "@/lib/pwa/suscribir";
import type { TextosCuenta } from "./textos";

// Ajustes → Tu cuenta: activar y desactivar las notificaciones de ESTE dispositivo.
// El permiso del navegador y la suscripción push son por dispositivo, así que el interruptor también.
// Si el navegador las tiene bloqueadas no se puede activar desde aquí: se explica y el interruptor queda apagado.

type Estado = "cargando" | "activas" | "apagadas" | "bloqueadas" | "ios-sin-instalar" | "no-disponible";

function pushDisponible() {
  return "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
}

export default function InterruptorNotificaciones({ t }: { t: TextosCuenta }) {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [cambiando, setCambiando] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!pushDisponible()) {
      setEstado(detectarPlataforma() === "ios" && !estaInstalada() ? "ios-sin-instalar" : "no-disponible");
      return;
    }
    if (Notification.permission === "denied") setEstado("bloqueadas");
    else if (Notification.permission === "granted" && !notificacionesApagadasAqui()) setEstado("activas");
    else setEstado("apagadas");
  }, []);

  async function activar() {
    const permiso = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
    if (permiso === "denied") {
      setEstado("bloqueadas");
      return;
    }
    if (permiso !== "granted") {
      // Cerró el aviso del navegador sin decidir: sigue apagado y se puede volver a intentar.
      setEstado("apagadas");
      return;
    }
    const r = await suscribirYGuardar();
    if (!r.ok) throw new Error(r.error);
    marcarNotificacionesApagadas(false);
    setEstado("activas");
  }

  async function apagar() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      const res = await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      const data = (await res.json().catch(() => ({ ok: false }))) as { ok: boolean };
      if (!data.ok) throw new Error("El servidor no apagó el dispositivo");
      await sub.unsubscribe();
    }
    // La marca evita que Inicio vuelva a registrar este dispositivo sin que la persona lo pida.
    marcarNotificacionesApagadas(true);
    setEstado("apagadas");
  }

  async function alternar() {
    if (cambiando) return;
    setError(false);
    setCambiando(true);
    try {
      if (estado === "activas") await apagar();
      else await activar();
    } catch {
      setError(true);
    }
    setCambiando(false);
  }

  if (estado === "cargando") return null;

  const encendido = estado === "activas";
  const sePuedeCambiar = estado === "activas" || estado === "apagadas";
  const descripcion =
    estado === "activas"
      ? t.notifActivas
      : estado === "apagadas"
        ? t.notifApagadas
        : estado === "bloqueadas"
          ? t.notifBloqueadas
          : estado === "ios-sin-instalar"
            ? t.notifIosSinInstalar
            : t.notifNoDisponible;

  return (
    <div className="flex flex-col gap-espacio-s">
      <div className="flex flex-wrap items-center justify-between gap-espacio-m">
        <h2 id="notificaciones" className="text-tarjeta leading-7">
          {t.notifTitulo}
        </h2>
        <button
          type="button"
          role="switch"
          aria-checked={encendido}
          aria-labelledby="notificaciones"
          aria-describedby="notificaciones-estado"
          disabled={!sePuedeCambiar || cambiando}
          onClick={alternar}
          className="relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border-2 border-text bg-surface transition-colors disabled:opacity-60 aria-checked:border-brand-primary aria-checked:bg-brand-primary focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-foco-anillo"
        >
          <span
            aria-hidden="true"
            className={`size-5 rounded-full transition-transform ${encendido ? "translate-x-7 bg-surface" : "translate-x-1 bg-text"}`}
          />
          <span className="sr-only">{t.notifEtiqueta}</span>
        </button>
      </div>
      <p id="notificaciones-estado" className="text-base leading-6 text-text-muted">
        {cambiando ? t.notifCambiando : descripcion}
      </p>
      {sePuedeCambiar && <p className="text-sm leading-[21px] text-text-muted">{t.notifSoloAqui}</p>}
      {error && (
        <p role="alert" className="text-base font-semibold leading-6 text-danger">
          {t.notifError}
        </p>
      )}
    </div>
  );
}
