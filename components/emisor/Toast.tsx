"use client";

import { useEffect, useRef, useState } from "react";

// Aviso temporal. Sale ARRIBA para no tapar los botones fijos ni el menú de abajo.
// La región role="status" existe vacía primero y el texto entra después: así los lectores de
// pantalla lo anuncian. No roba el foco, se puede cerrar y dura 8 s; el tiempo se para
// mientras el ratón o el foco están encima (WCAG 2.2.1). Al verse se limpia la dirección
// (?enviada=1) para que no reaparezca al recargar.
const DURACION = 8000;

export default function Toast({ texto, quitarParametro, cerrar = "Cerrar aviso" }: { texto: string; quitarParametro?: string; cerrar?: string }) {
  const [visible, setVisible] = useState(true);
  const [anunciado, setAnunciado] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  function parar() {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = null;
  }
  function arrancar() {
    parar();
    temporizador.current = setTimeout(() => setVisible(false), DURACION);
  }

  useEffect(() => {
    if (quitarParametro) {
      const url = new URL(window.location.href);
      url.searchParams.delete(quitarParametro);
      window.history.replaceState(null, "", url.pathname + url.search);
    }
    const id = setTimeout(() => setAnunciado(true), 50);
    arrancar();
    return () => {
      clearTimeout(id);
      parar();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quitarParametro]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 mx-auto flex max-w-md justify-center px-4">
      <div role="status">
        {visible && anunciado && (
          <div
            onMouseEnter={parar}
            onMouseLeave={arrancar}
            onFocus={parar}
            onBlur={arrancar}
            className="pointer-events-auto flex items-center gap-3 rounded-lg bg-text px-4 py-3 text-surface shadow-lg"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12l5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="font-medium">{texto}</p>
            <button
              type="button"
              onClick={() => setVisible(false)}
              aria-label={cerrar}
              className="-mr-2 inline-flex size-11 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-surface"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
