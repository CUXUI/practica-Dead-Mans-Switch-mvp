"use client";

// Instalación del PWA desde la landing. Propio de la landing (no importa nada de otros flujos).
// Android/Chrome: el navegador dispara beforeinstallprompt cuando se puede instalar; si no lo hace,
// se muestran los pasos manuales. iPhone: siempre pasos manuales.

type AvisoInstalacion = Event & {
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

export function hayAvisoInstalacion() {
  return guardado !== null;
}

export function alCambiarAviso(fn: () => void) {
  oyentes.add(fn);
  return () => {
    oyentes.delete(fn);
  };
}

/** Abre el aviso de instalación del navegador. Devuelve true si el usuario aceptó. */
export async function instalarConAviso(): Promise<boolean> {
  const aviso = guardado;
  if (!aviso) return false;
  await aviso.prompt();
  const { outcome } = await aviso.userChoice;
  guardado = null;
  oyentes.forEach((fn) => fn());
  return outcome === "accepted";
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
