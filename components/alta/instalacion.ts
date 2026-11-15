"use client";

// Captura el aviso de instalación de Android/Chrome (beforeinstallprompt).
// El navegador lo dispara una sola vez por carga de página, a veces antes de llegar
// a la guía; por eso se escucha desde que se importa este módulo (también en el registro).

export type AvisoInstalacion = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let guardado: AvisoInstalacion | null = null;
const oyentes = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    guardado = e as AvisoInstalacion;
    oyentes.forEach((fn) => fn());
  });
  window.addEventListener("appinstalled", () => {
    guardado = null;
    oyentes.forEach((fn) => fn());
  });
}

export function avisoInstalacion() {
  return guardado;
}

export function alCambiarAviso(fn: () => void) {
  oyentes.add(fn);
  return () => {
    oyentes.delete(fn);
  };
}

export function consumirAviso() {
  guardado = null;
}

export type Plataforma = "ios" | "android" | "escritorio";

export function detectarPlataforma(): Plataforma {
  const ua = navigator.userAgent;
  const esIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (esIOS) return "ios";
  if (/Android/.test(ua)) return "android";
  return "escritorio";
}

export function estaInstalada() {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia("(display-mode: standalone)").matches;
}
