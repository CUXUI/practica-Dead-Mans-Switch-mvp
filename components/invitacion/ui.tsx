"use client";

import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import type { TextosInvitacion } from "./textos";
import { boton as botonDS, card, FOCO } from "@/components/ds/estilos";

// Piezas del flujo de invitación. Solo tokens semánticos de Tailwind (AGENTS.md sección 5).

export function Boton({
  variante = "primario",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: "primario" | "secundario" }) {
  return (
    <button className={`${variante === "primario" ? botonDS.principal : botonDS.secundario} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Caja({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <section aria-label={titulo} className={`${card("contorno")} px-espacio-l`}>
      {titulo && <h2 className="text-bloque">{titulo}</h2>}
      {children}
    </section>
  );
}

/** Una duda frecuente. Se abre de a una (lo controla quien la usa): "+" cerrada, "−" abierta. */
export function Desplegable({
  id,
  resumen,
  abierto,
  onToggle,
  children,
}: {
  id: string;
  resumen: string;
  abierto: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-radio-m border border-borde-sutil bg-surface">
      <button
        type="button"
        id={`${id}-boton`}
        aria-expanded={abierto}
        aria-controls={`${id}-panel`}
        onClick={onToggle}
        className={`flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left font-semibold rounded-radio-m ${FOCO}`}
      >
        <span aria-hidden="true" className="w-4 text-center font-bold">
          {abierto ? "\u2212" : "+"}
        </span>
        {resumen}
      </button>
      <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-boton`} hidden={!abierto}>
        <p className="px-4 pb-4 pl-11 text-text-muted">{children}</p>
      </div>
    </div>
  );
}

export function Aviso({ tono = "info", children }: { tono?: "info" | "error"; children: ReactNode }) {
  const estilo = tono === "error" ? "border-danger text-danger" : "border-border";
  return (
    <p role={tono === "error" ? "alert" : "status"} className={`rounded-radio-m border bg-surface p-3 ${estilo}`}>
      {children}
    </p>
  );
}

/** Marco de cada pantalla: nombre de la marca, título (recibe el foco al aparecer), contenido y acciones. */
export function Marco({
  marca,
  titulo,
  acciones,
  children,
}: {
  marca: string;
  titulo: string;
  acciones?: ReactNode;
  children: ReactNode;
}) {
  const tituloRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => tituloRef.current?.focus(), []);
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-6">
      <p className="font-bold">{marca}</p>
      <h1 ref={tituloRef} tabIndex={-1} className="text-seccion focus:outline-none">
        {titulo}
      </h1>
      <div className="flex flex-1 flex-col gap-4">{children}</div>
      {acciones && <div className="flex flex-col gap-3">{acciones}</div>}
    </main>
  );
}
