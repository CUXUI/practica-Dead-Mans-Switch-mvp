"use client";

import { useEffect } from "react";
import { suscribirYGuardar } from "@/lib/pwa/suscribir";
import { notificacionesApagadasAqui } from "@/lib/pwa/optout";

// Si la persona ya dio permiso pero este dispositivo no quedó registrado (falló la red, ahorro de batería,
// se borró en el servidor...), Inicio lo intenta de nuevo solo: al abrir, al volver a la app y al cambiar de red.
// Así no depende de que la persona repita nada ni cambie de red a mano. No pregunta ni molesta: si falla, calla.
//
// CONEXIÓN · Alta (Sarah): acordado con Sarah, la sincronización de notificaciones la lleva el flujo de quien
// emite. Lo que supuse: el alta pide el permiso y registra el dispositivo con la misma función
// (suscribirYGuardar de lib/pwa/suscribir.ts, que llama a /api/push/subscribe). Aquí solo se repite
// el registro si el permiso ya está concedido. Nunca se pide permiso desde Inicio.
const CLAVE_INTENTO = "dms-push-ultimo-intento";
const CLAVE_OK = "dms-push-ok";
const ESPERA_MS = 2 * 60_000;

export default function SincronizarNotificaciones() {
  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission !== "granted") return;
    // Si la persona las apagó a propósito en Ajustes, no se vuelve a registrar el dispositivo solo.
    if (notificacionesApagadasAqui()) return;

    let enCurso = false;
    const intentar = async () => {
      if (enCurso) return;
      try {
        if (sessionStorage.getItem(CLAVE_OK)) return;
        const ultimo = Number(localStorage.getItem(CLAVE_INTENTO) ?? 0);
        if (Date.now() - ultimo < ESPERA_MS) return;
        localStorage.setItem(CLAVE_INTENTO, String(Date.now()));
      } catch {
        // Sin almacenamiento: se intenta igual, una vez por apertura.
      }
      enCurso = true;
      const r = await suscribirYGuardar(1);
      enCurso = false;
      if (r.ok) {
        try {
          sessionStorage.setItem(CLAVE_OK, "1");
        } catch {}
      }
    };

    intentar();
    const alVolver = () => {
      if (document.visibilityState === "visible") intentar();
    };
    window.addEventListener("online", intentar);
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      window.removeEventListener("online", intentar);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, []);
  return null;
}
