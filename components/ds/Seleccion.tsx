"use client";

import { useId, useRef, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import Icono from "./Icono";
import { FOCO, TRANSICION } from "./estilos";

// Controles de selección (03 · Formularios y controles). En todos, la fila completa es el objetivo
// táctil (mínimo 48 px) y el estado no depende solo del color: cambia la forma (marca, punto, posición).

const FILA = "flex min-h-12 cursor-pointer items-center gap-espacio-m text-cuerpo text-text has-[:disabled]:cursor-not-allowed has-[:disabled]:text-text-muted";

// Opción/Checkbox (Figma 2172:1081).
export function Casilla({ children, className = "", ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { children: ReactNode }) {
  return (
    <label className={`${FILA} ${className}`}>
      <span className="relative inline-flex size-6 shrink-0">
        <input type="checkbox" className={`peer size-6 appearance-none rounded-[6px] border-2 border-border bg-surface checked:border-brand-primary checked:bg-brand-primary disabled:border-accion-desactivada disabled:checked:bg-accion-desactivada ${TRANSICION} ${FOCO}`} {...rest} />
        <Icono nombre="check" tamano={16} className="pointer-events-none absolute inset-0 m-auto stroke-[3] text-brand-on-primary opacity-0 peer-checked:opacity-100 peer-disabled:text-sobre-desactivada" />
      </span>
      <span>{children}</span>
    </label>
  );
}

// Radio Button (Figma 2293:1422). Va dentro de un <fieldset> con su <legend>.
export function Radio({ children, className = "", ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { children: ReactNode }) {
  return (
    <label className={`${FILA} ${className}`}>
      <span className="relative inline-flex size-6 shrink-0">
        <input type="radio" className={`peer size-6 appearance-none rounded-full border-2 border-border bg-surface checked:border-brand-primary disabled:border-accion-desactivada ${TRANSICION} ${FOCO}`} {...rest} />
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 m-auto size-3 scale-0 rounded-full bg-brand-primary transition-transform duration-(--duracion-rapida) peer-checked:scale-100 peer-disabled:bg-accion-desactivada motion-reduce:transition-none" />
      </span>
      <span>{children}</span>
    </label>
  );
}

// Control/Interruptor (Figma 2279:1427). Para algo que se aplica al instante. La etiqueta dice la acción,
// no el estado: «Toca para apagar tu aviso». El círculo cambia de lado y de color.
export function Interruptor({ activado, onCambiar, etiqueta, deshabilitado = false, descripcion }: { activado: boolean; onCambiar: (v: boolean) => void; etiqueta: string; deshabilitado?: boolean; descripcion?: string }) {
  const id = useId();
  return (
    <div className="flex min-h-12 items-center justify-between gap-espacio-m">
      <div className="min-w-0">
        <p id={`${id}-etiqueta`} className={`text-cuerpo ${deshabilitado ? "text-text-muted" : "text-text"}`}>
          {etiqueta}
        </p>
        {descripcion && (
          <p id={`${id}-descripcion`} className="text-pequeno text-text-muted">
            {descripcion}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={activado}
        aria-labelledby={`${id}-etiqueta`}
        aria-describedby={descripcion ? `${id}-descripcion` : undefined}
        disabled={deshabilitado}
        onClick={() => onCambiar(!activado)}
        className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border-2 border-text bg-surface aria-checked:border-brand-primary aria-checked:bg-brand-primary disabled:cursor-not-allowed disabled:border-accion-desactivada disabled:aria-checked:bg-accion-desactivada ${TRANSICION} ${FOCO}`}
      >
        <span aria-hidden="true" className={`size-5 rounded-full transition-transform duration-(--duracion-media) ease-estandar motion-reduce:transition-none ${activado ? "translate-x-7 bg-surface" : `translate-x-1 ${deshabilitado ? "bg-accion-desactivada" : "bg-text"}`}`} />
      </button>
    </div>
  );
}

// Control segmento (Figma 2942:12332 y sus piezas). Elegir una opción entre 2 o 3 que caben en una fila.
// Seleccionado: fondo accion/principal, texto inverso y peso Etiqueta. Teclado: flechas, como un grupo de radio.
export function ControlSegmentado<T extends string>({ etiqueta, opciones, valor, onCambiar, deshabilitado = false }: { etiqueta: string; opciones: readonly { valor: T; texto: string }[]; valor: T; onCambiar: (v: T) => void; deshabilitado?: boolean }) {
  const grupo = useRef<HTMLDivElement>(null);
  function tecla(e: KeyboardEvent<HTMLDivElement>) {
    const paso = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!paso) return;
    e.preventDefault();
    const i = opciones.findIndex((o) => o.valor === valor);
    const siguiente = opciones[(i + paso + opciones.length) % opciones.length];
    onCambiar(siguiente.valor);
    grupo.current?.querySelector<HTMLButtonElement>(`[data-valor="${siguiente.valor}"]`)?.focus();
  }
  return (
    <div ref={grupo} role="radiogroup" aria-label={etiqueta} onKeyDown={tecla} className="grid auto-cols-fr grid-flow-col overflow-hidden rounded-radio-m border border-border bg-surface">
      {opciones.map((o) => {
        const elegido = o.valor === valor;
        return (
          <button
            key={o.valor}
            type="button"
            role="radio"
            data-valor={o.valor}
            aria-checked={elegido}
            tabIndex={elegido ? 0 : -1}
            disabled={deshabilitado}
            onClick={() => onCambiar(o.valor)}
            className={`min-h-12 px-espacio-s text-center ${TRANSICION} ${FOCO} focus-visible:z-10 focus-visible:rounded-radio-s disabled:cursor-not-allowed ${
              elegido
                ? "bg-brand-primary text-etiqueta text-brand-on-primary active:bg-accion-principal-pulsada disabled:bg-accion-desactivada disabled:text-sobre-desactivada"
                : "bg-surface text-cuerpo text-text hover:bg-fondo-sutil active:bg-estado-aviso-fondo disabled:text-sobre-desactivada"
            }`}
          >
            {o.texto}
          </button>
        );
      })}
    </div>
  );
}
