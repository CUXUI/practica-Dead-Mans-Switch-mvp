"use client";

import { useEffect, useRef, useState } from "react";

// Botón para mantener presionado (Biblioteca): en reposo se ve como Principal (oscuro, texto claro); al
// mantenerlo se ve como secundario (fondo blanco, borde de 2 px) y se llena de oscuro, de izquierda a derecha.
// Al completar 2 s ejecuta la acción.
// Siempre lleva una línea de ayuda debajo. Con lector de pantalla o teclado no se puede "mantener": la
// activación asistida (clic sin puntero, event.detail === 0) completa la acción directamente, porque el
// diálogo que lo contiene ya es el paso de confirmación.
export default function BotonMantener({
  label,
  ayuda,
  busyLabel,
  busy = false,
  onComplete,
  durationMs = 2000,
}: {
  label: string;
  ayuda: string;
  busyLabel: string;
  busy?: boolean;
  onComplete: () => void;
  durationMs?: number;
}) {
  const [progreso, setProgreso] = useState(0);
  const [ancho, setAncho] = useState(0);
  const boton = useRef<HTMLButtonElement>(null);
  const raf = useRef<number | null>(null);
  const inicio = useRef(0);
  const terminado = useRef(false);

  function pararFrame() {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = null;
  }
  useEffect(() => pararFrame, []);

  function tick(ahora: number) {
    const p = Math.min(1, (ahora - inicio.current) / durationMs);
    setProgreso(p);
    if (p >= 1) {
      raf.current = null;
      terminado.current = true;
      onComplete();
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }

  function empezar() {
    if (busy || terminado.current) return;
    setAncho(boton.current?.offsetWidth ?? 0);
    inicio.current = performance.now();
    raf.current = requestAnimationFrame(tick);
  }

  function soltar() {
    pararFrame();
    if (!terminado.current) setProgreso(0);
  }

  function alHacerClic(e: React.MouseEvent) {
    if (e.detail === 0 && !busy && !terminado.current) {
      terminado.current = true;
      onComplete();
    }
  }

  // Tras un intento fallido el padre vuelve a habilitar el botón: se permite repetir.
  useEffect(() => {
    if (!busy) {
      terminado.current = false;
      setProgreso(0);
    }
  }, [busy]);

  const texto = busy ? busyLabel : label;
  return (
    <div className="space-y-espacio-s">
      <button
        ref={boton}
        type="button"
        aria-describedby="ayuda-mantener"
        disabled={busy}
        onPointerDown={empezar}
        onPointerUp={soltar}
        onPointerLeave={soltar}
        onPointerCancel={soltar}
        onContextMenu={(e) => e.preventDefault()}
        onClick={alHacerClic}
        className={`relative inline-flex min-h-12 w-full touch-none select-none items-center justify-center overflow-hidden rounded-[var(--spacing-radio-m)] border-2 px-espacio-xl text-base font-bold leading-6 disabled:cursor-not-allowed disabled:border-accion-desactivada disabled:bg-accion-desactivada disabled:text-[var(--text-color-sobre-desactivada)] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-foco-anillo ${
          progreso > 0 ? "border-fondo-inverso bg-surface text-text" : "border-fondo-inverso bg-fondo-inverso text-brand-on-primary"
        }`}
      >
        <span className="relative">{texto}</span>
        {/* Relleno que avanza; el mismo texto va encima en claro para que se lea sobre lo oscuro. */}
        <span aria-hidden="true" className="absolute inset-y-0 left-0 overflow-hidden bg-fondo-inverso" style={{ width: `${Math.round(progreso * 100)}%` }}>
          <span className="absolute inset-y-0 left-0 flex items-center justify-center text-brand-on-primary" style={{ width: ancho }}>
            {texto}
          </span>
        </span>
      </button>
      <p id="ayuda-mantener" className="text-sm leading-[21px] text-text-muted">
        {ayuda}
      </p>
    </div>
  );
}
