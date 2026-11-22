"use client";

import { useEffect, useRef, useState } from "react";
import { textosLanding } from "@/components/landing/textos";

// Contenedor de video del hero. El video es decorativo (sin audio ni información que no esté en el texto).
// - Celular: usa la versión vertical. Pantallas más grandes: la horizontal. Cada una en mp4 y webm.
// - Si la persona pidió menos movimiento en su dispositivo, no se reproduce solo: se ve la imagen fija.
// - Botón para pausar y reanudar (un video que se mueve más de 5 segundos debe poder detenerse).
// Los archivos están en /public/landing/video. Para cambiar el video, se reemplazan ahí con el mismo nombre.

const BASE = "/landing/video";
const PANTALLA_GRANDE = "(min-width: 768px)";
const MENOS_MOVIMIENTO = "(prefers-reduced-motion: reduce)";

export default function VideoHero() {
  const video = useRef<HTMLVideoElement>(null);
  const [orientacion, setOrientacion] = useState<"horizontal" | "vertical">("horizontal");
  const [reproduciendo, setReproduciendo] = useState(false);
  const t = textosLanding.hero.video;

  // Elige la versión según el tamaño de pantalla y la actualiza si cambia (por ejemplo al girar el celular).
  useEffect(() => {
    const consulta = window.matchMedia(PANTALLA_GRANDE);
    const actualizar = () => setOrientacion(consulta.matches ? "horizontal" : "vertical");
    actualizar();
    consulta.addEventListener("change", actualizar);
    return () => consulta.removeEventListener("change", actualizar);
  }, []);

  // Al cambiar de versión se vuelve a cargar el video; solo se reproduce solo si no pidieron menos movimiento.
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    el.load();
    if (window.matchMedia(MENOS_MOVIMIENTO).matches) {
      setReproduciendo(false);
      return;
    }
    el.play().then(
      () => setReproduciendo(true),
      () => setReproduciendo(false),
    );
  }, [orientacion]);

  function alternar() {
    const el = video.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  }

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-fondo-sutil md:aspect-video">
      <video
        ref={video}
        className="size-full object-cover"
        poster={`${BASE}/hero-poster.jpg`}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        onPlay={() => setReproduciendo(true)}
        onPause={() => setReproduciendo(false)}
      >
        <source src={`${BASE}/hero-${orientacion}.webm`} type="video/webm" />
        <source src={`${BASE}/hero-${orientacion}.mp4`} type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={alternar}
        aria-pressed={reproduciendo}
        className="absolute bottom-3 right-3 inline-flex min-h-12 items-center rounded-full bg-fondo-inverso px-4 text-sm font-semibold text-brand-on-primary transition-colors hover:bg-negro motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
      >
        {reproduciendo ? t.pausar : t.reproducir}
      </button>
    </div>
  );
}
