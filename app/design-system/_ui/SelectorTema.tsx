"use client";

import { useEffect, useState } from "react";
import { CLAVE_TEMA } from "@/lib/ds/tema";
import { TOKENS, TEMAS, type Tema } from "@/lib/ds/tokens";
import { FOCO } from "@/components/ds/estilos";

// Cambia el tema de toda la app en este navegador (data-tema en <html>) y lo recuerda.
// Es la demostración de la marca blanca: un solo token cambia y todo el producto lo sigue.
export default function SelectorTema({ compacto = false }: { compacto?: boolean }) {
  const [tema, setTema] = useState<Tema | null>(null);

  useEffect(() => {
    const actual = document.documentElement.getAttribute("data-tema");
    setTema((TEMAS as readonly string[]).includes(actual ?? "") ? (actual as Tema) : "base");
  }, []);

  function elegir(t: Tema) {
    document.documentElement.setAttribute("data-tema", t);
    try {
      localStorage.setItem(CLAVE_TEMA, t);
    } catch {
      // Sin almacenamiento (modo privado): el tema dura lo que dure la página.
    }
    setTema(t);
  }

  return (
    <div role="radiogroup" aria-label="Tema de marca" className="inline-flex items-center gap-espacio-xs rounded-radio-pill border border-borde-sutil bg-surface p-1">
      {TEMAS.map((t) => {
        const elegido = tema === t;
        const color = TOKENS.color["accion/principal"].valor[t];
        return (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={elegido}
            onClick={() => elegir(t)}
            className={`inline-flex min-h-10 items-center gap-espacio-s rounded-radio-pill px-espacio-m text-pequeno transition-colors duration-(--duracion-rapida) motion-reduce:transition-none ${FOCO} ${elegido ? "bg-fondo-inverso font-semibold text-inverso" : "text-text hover:bg-fondo-sutil"}`}
          >
            <span aria-hidden="true" className="size-4 rounded-full border border-surface" style={{ background: color }} />
            <span className={compacto ? "sr-only sm:not-sr-only" : ""}>{TOKENS.temas[t].nombre}</span>
          </button>
        );
      })}
    </div>
  );
}
