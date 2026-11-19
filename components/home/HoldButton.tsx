"use client";

import { useEffect, useId, useRef, useState } from "react";

// Acción deliberada (AGENTS.md): mantener presionado 2 s. Ningún toque suelto ejecuta nada.
// Con lector de pantalla o teclado no se puede "mantener": la activación asistida (un clic
// sin puntero, event.detail === 0) pasa a un paso de confirmación con botones normales.
// El foco va a la pregunta al abrirla y vuelve al botón con "Volver", para no perderse.
//
// Versión C de "Cancelar alerta" (PRD 12/11, E6): la instrucción va ARRIBA del botón y en grande, con un
// icono en forma de anillo que se completa a la vez que el botón. Al mantener, una capa gris clara cubre el
// botón de izquierda a derecha y el texto pasa a oscuro justo donde llega. Si se suelta antes, se vacía.
// Con zoom al 200 % el texto se parte en líneas y el botón crece; nada se corta ni se pisa.
const CIRCUNFERENCIA = 125.66; // 2 · π · 20

export default function HoldButton({
  label,
  help,
  helpSmall,
  holdingLabel,
  helpAssisted,
  confirmQuestion,
  confirmYes,
  confirmBack,
  busyLabel,
  busy = false,
  onComplete,
  durationMs = 2000,
}: {
  label: string;
  // Instrucción principal, arriba y en grande: "Mantén presionado el botón 2 segundos".
  help: string;
  // Qué pasa si se suelta antes.
  helpSmall: string;
  // Texto de estado mientras se mantiene: "Sigue presionando…".
  holdingLabel: string;
  // Solo para teclado o lector de pantalla.
  helpAssisted: string;
  confirmQuestion: string;
  confirmYes: string;
  confirmBack: string;
  busyLabel: string;
  busy?: boolean;
  onComplete: () => void;
  durationMs?: number;
}) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const raf = useRef<number | null>(null);
  const startedAt = useRef(0);
  const finished = useRef(false);
  const helpId = useId();
  const question = useRef<HTMLParagraphElement>(null);
  const holdButton = useRef<HTMLButtonElement>(null);
  const reopened = useRef(false);

  useEffect(() => {
    if (confirming) question.current?.focus();
    else if (reopened.current) holdButton.current?.focus();
  }, [confirming]);

  function stopFrame() {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = null;
  }

  useEffect(() => stopFrame, []);

  function tick(now: number) {
    const p = Math.min(1, (now - startedAt.current) / durationMs);
    setProgress(p);
    if (p >= 1) {
      raf.current = null;
      finished.current = true;
      setHolding(false);
      onComplete();
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }

  function startHold() {
    if (busy || finished.current) return;
    startedAt.current = performance.now();
    setHolding(true);
    raf.current = requestAnimationFrame(tick);
  }

  function cancelHold() {
    stopFrame();
    setHolding(false);
    if (!finished.current) setProgress(0);
  }

  function onClick(e: React.MouseEvent) {
    // Un clic de puntero ya lo maneja el mantener presionado; solo el asistido abre la confirmación.
    if (e.detail === 0 && !busy) setConfirming(true);
  }

  function confirm() {
    setConfirming(false);
    finished.current = true;
    onComplete();
  }

  // Tras un intento fallido el padre vuelve a habilitar el botón: se permite repetir.
  useEffect(() => {
    if (!busy) {
      finished.current = false;
      setProgress(0);
    }
  }, [busy]);

  if (confirming) {
    return (
      <div role="group" aria-label={confirmQuestion} className="space-y-3">
        <p ref={question} tabIndex={-1} className="text-lg font-semibold leading-6">
          {confirmQuestion}
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={confirm}
            className="min-h-12 w-full rounded-lg bg-brand-primary px-4 py-3 font-bold text-brand-on-primary focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-foco-anillo"
          >
            {confirmYes}
          </button>
          <button
            type="button"
            onClick={() => {
              reopened.current = true;
              setConfirming(false);
            }}
            className="min-h-12 w-full rounded-lg border border-border bg-surface px-4 py-3 font-bold text-text focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-foco-anillo"
          >
            {confirmBack}
          </button>
        </div>
      </div>
    );
  }

  const textoBoton = busy ? busyLabel : label;
  const capa = "flex min-h-14 flex-col items-center justify-center px-4 py-3 text-center text-base font-bold leading-6";

  return (
    <div className="space-y-3">
      {/* La instrucción, arriba y en grande. Se parte en líneas con zoom: nunca se corta. */}
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-fondo-sutil">
          <svg viewBox="0 0 48 48" className="absolute -inset-0.5 size-12 -rotate-90" fill="none" strokeWidth="4">
            <circle cx="24" cy="24" r="20" className="stroke-borde-sutil" />
            <circle
              cx="24"
              cy="24"
              r="20"
              strokeLinecap="round"
              className="stroke-brand-primary"
              strokeDasharray={CIRCUNFERENCIA}
              strokeDashoffset={CIRCUNFERENCIA * (1 - progress)}
              style={{ transition: holding ? "none" : "stroke-dashoffset 300ms" }}
            />
          </svg>
          <svg viewBox="0 0 24 24" className="relative size-6" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <circle cx="12" cy="12" r="6.5" />
            <circle cx="12" cy="12" r="10" opacity=".5" />
          </svg>
        </span>
        <div className="min-w-0 space-y-1">
          <p id={helpId} className="text-lg font-semibold leading-6 text-text">
            {help}
          </p>
          <p className="text-sm leading-[21px] text-text-muted">{helpSmall}</p>
        </div>
      </div>

      <button
        ref={holdButton}
        type="button"
        aria-describedby={helpId}
        disabled={busy}
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onContextMenu={(e) => e.preventDefault()}
        onClick={onClick}
        className="relative block w-full touch-none select-none overflow-hidden rounded-lg border-2 border-brand-primary bg-brand-primary p-0 text-brand-on-primary disabled:opacity-60 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-foco-anillo"
      >
        {/* Capa de reposo: marca la altura del botón, así que crece si el texto se parte en líneas. */}
        <span aria-hidden="true" className={`relative ${capa}`}>
          {textoBoton}
        </span>
        {/* Capa que se llena: mismo texto, mismo relleno, recortada de izquierda a derecha. */}
        <span
          aria-hidden="true"
          className={`absolute inset-0 bg-borde-sutil text-text ${capa} ${holding ? "" : "transition-[clip-path] duration-300 motion-reduce:transition-none"}`}
          style={{ clipPath: `inset(0 ${100 - progress * 100}% 0 0)` }}
        >
          {textoBoton}
        </span>
        <span className="sr-only">
          {textoBoton}. {help}. {helpAssisted}
        </span>
      </button>
      <p role="status" className="min-h-[22px] text-sm leading-[21px] text-text-muted">
        {holding ? holdingLabel : ""}
      </p>
    </div>
  );
}
