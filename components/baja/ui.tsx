"use client";

import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export function BotonBaja({
  variante = "principal",
  children,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: "principal" | "secundario" }) {
  const color = variante === "principal" ? "bg-brand-primary text-brand-on-primary" : "border border-border bg-surface text-text";
  return (
    <button
      {...props}
      type={type}
      className={`min-h-12 w-full rounded-xl px-6 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:opacity-60 ${color}`}
    >
      {children}
    </button>
  );
}

export function MarcoBaja({
  marca,
  titulo,
  etiqueta,
  acciones,
  children,
}: {
  marca: string;
  titulo: string;
  etiqueta?: string;
  acciones?: ReactNode;
  children: ReactNode;
}) {
  const tituloRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => tituloRef.current?.focus(), [titulo]);
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col bg-surface p-4">
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <span aria-hidden="true" className="inline-flex size-8 items-center justify-center rounded-full bg-brand-primary text-brand-on-primary">
            {marca.slice(0, 1)}
          </span>
          <span>{marca}</span>
        </div>
        {etiqueta && <p className="text-sm text-text-muted">{etiqueta}</p>}
        <h1 ref={tituloRef} tabIndex={-1} className="text-[28px] font-bold leading-9 focus:outline-none">
          {titulo}
        </h1>
        <div className="flex flex-1 flex-col gap-4">{children}</div>
      </div>
      {/* Botones: pegados abajo solo si la pantalla es alta. Con zoom al 200 % (o texto grande) la pantalla es baja y los
          botones, que crecen, taparían el texto: entonces van al final del contenido y se llega a ellos con el scroll.
          Al ir en el flujo (no fijos), el texto de encima nunca queda debajo de ellos. */}
      {acciones && (
        <div className="-mx-4 -mb-4 mt-4 space-y-2 border-t border-border/40 bg-surface p-4 [@media(min-height:36rem)]:sticky [@media(min-height:36rem)]:bottom-0">
          {acciones}
        </div>
      )}
    </main>
  );
}
