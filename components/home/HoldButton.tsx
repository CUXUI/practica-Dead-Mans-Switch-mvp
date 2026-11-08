"use client";

import { useEffect, useRef, useState } from "react";

// Acción deliberada (AGENTS.md): mantener presionado 2 s. Ningún toque suelto ejecuta nada.
// Con lector de pantalla o teclado no se puede "mantener": la activación asistida (un clic
// sin puntero, event.detail === 0) pasa a un paso de confirmación con botones normales.
export default function HoldButton({
  label,
  help,
  confirmQuestion,
  confirmYes,
  confirmBack,
  busyLabel,
  busy = false,
  onComplete,
  durationMs = 2000,
}: {
  label: string;
  help: string;
  confirmQuestion: string;
  confirmYes: string;
  confirmBack: string;
  busyLabel: string;
  busy?: boolean;
  onComplete: () => void;
  durationMs?: number;
}) {
  const [progress, setProgress] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const raf = useRef<number | null>(null);
  const startedAt = useRef(0);
  const finished = useRef(false);

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
      onComplete();
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }

  function startHold() {
    if (busy || finished.current) return;
    startedAt.current = performance.now();
    raf.current = requestAnimationFrame(tick);
  }

  function cancelHold() {
    stopFrame();
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
        <p className="font-medium">{confirmQuestion}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={confirm}
            className="min-h-11 flex-1 rounded-lg bg-brand-primary px-4 py-2 font-medium text-brand-on-primary"
          >
            {confirmYes}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="min-h-11 flex-1 rounded-lg border border-border px-4 py-2 font-medium"
          >
            {confirmBack}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        aria-describedby="hold-help"
        disabled={busy}
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onContextMenu={(e) => e.preventDefault()}
        onClick={onClick}
        className="relative min-h-14 w-full touch-none select-none overflow-hidden rounded-lg border-2 border-brand-primary bg-surface px-4 py-3 font-semibold disabled:opacity-60"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 bg-brand-primary/25"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
        <span className="relative">{busy ? busyLabel : label}</span>
      </button>
      <p id="hold-help" className="text-sm text-text-muted">
        {help}
      </p>
    </div>
  );
}
