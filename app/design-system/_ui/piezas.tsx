import type { ReactNode } from "react";
import type { Tema } from "@/lib/ds/tokens";
import Icono from "@/components/ds/Icono";
import { FOCO } from "@/components/ds/estilos";

// Piezas de la documentación (no son componentes del producto).
export const ARCHIVO_FIGMA = "https://www.figma.com/design/SivWKbg1aOefpcFusEFfOZ/";
export const REPO = "https://github.com/CUXUI/practica-Dead-Mans-Switch-mvp";
export const enFigma = (nodo: string) => `${ARCHIVO_FIGMA}?node-id=${nodo.replace(":", "-")}`;

export function TituloPagina({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className="mb-espacio-2xl">
      <h1 className="text-pantalla">{titulo}</h1>
      {children && <p className="mt-espacio-s max-w-2xl text-cuerpo text-text-muted">{children}</p>}
    </div>
  );
}

export function Seccion({ id, titulo, children, descripcion }: { id: string; titulo: string; descripcion?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-t`} className="mb-espacio-seccion scroll-mt-24">
      <h2 id={`${id}-t`} className="text-seccion">
        {titulo}
      </h2>
      {descripcion && <p className="mt-espacio-xs max-w-2xl text-cuerpo text-text-muted">{descripcion}</p>}
      <div className="mt-espacio-xl">{children}</div>
    </section>
  );
}

// Lienzo donde se muestra un componente funcionando.
export function Lienzo({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-radio-l border border-borde-sutil bg-surface p-espacio-xl ${className}`}>{children}</div>;
}

export function EnlaceExterno({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={`inline-flex min-h-12 items-center gap-espacio-xs rounded-radio-s text-pequeno font-semibold underline underline-offset-4 hover:decoration-2 ${FOCO}`}>
      {children}
      <Icono nombre="arrow-right" tamano={16} className="-rotate-45" />
      <span className="sr-only"> (se abre en otra pestaña)</span>
    </a>
  );
}

export function Codigo({ children }: { children: string }) {
  return (
    <pre tabIndex={0} className={`overflow-x-auto rounded-radio-m bg-fondo-inverso p-espacio-l text-pequeno text-inverso ${FOCO}`}>
      <code className="font-mono">{children}</code>
    </pre>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return <code className="rounded-radio-s bg-fondo-sutil px-1.5 py-0.5 font-mono text-[13px] text-text">{children}</code>;
}

// Marco de teléfono. El transform hace que las pantallas del producto (position: fixed) se queden dentro.
// inert: es una vista previa, no se opera (los botones reales guardarían datos).
export function Telefono({ tema, children, etiqueta, compacto = false }: { tema?: Tema; children: ReactNode; etiqueta: string; compacto?: boolean }) {
  return (
    <figure className="flex flex-col items-center gap-espacio-m">
      <div data-tema={tema} className={`${compacto ? "lg:[zoom:0.78]" : ""} relative h-[680px] w-[340px] max-w-full overflow-hidden rounded-[2.5rem] border-[10px] border-fondo-inverso bg-surface-muted shadow-[0_24px_48px_-24px_rgb(0_0_0/0.45)] [transform:translateZ(0)]`}>
        <div inert className="h-full">
          {children}
        </div>
      </div>
      <figcaption className="text-pequeno text-text-muted">{etiqueta}</figcaption>
    </figure>
  );
}
