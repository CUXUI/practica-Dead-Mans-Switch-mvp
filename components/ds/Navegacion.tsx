import Link from "next/link";
import type { ReactNode } from "react";
import Icono, { type NombreIcono } from "./Icono";
import { FOCO, TRANSICION } from "./estilos";

// 04 · Navegación. Componentes de presentación: sirven en servidor y en cliente.

// Marca de la app (Figma 3723:26375): logo de 32 px + nombre. El logo es un marcador (marca blanca):
// círculo con la inicial en el color de la marca.
export function MarcaApp({ nombre, mostrarNombre = true }: { nombre: string; mostrarNombre?: boolean }) {
  return (
    <span className="inline-flex items-center gap-espacio-s">
      <span aria-hidden="true" className="inline-flex size-tamano-logo shrink-0 items-center justify-center rounded-full bg-brand-primary text-pequeno font-semibold text-brand-on-primary">
        {nombre.slice(0, 1)}
      </span>
      {mostrarNombre && <span className="text-etiqueta">{nombre}</span>}
    </span>
  );
}

// Encabezado (Figma 3937:20660): barra de marca con línea inferior y, si se pide, el saludo (h1 de la pantalla).
export function Encabezado({ nombre, saludo }: { nombre: string; saludo?: string }) {
  return (
    <header>
      <div className="flex items-center border-b border-borde-sutil bg-surface px-espacio-l py-espacio-s">
        <MarcaApp nombre={nombre} />
      </div>
      {saludo && <h1 className="px-espacio-l pt-espacio-l text-seccion">{saludo}</h1>}
    </header>
  );
}

// Barra de título (Figma 4708:65613): título de una pantalla interna, con volver opcional.
export function BarraTitulo({ titulo, volverHref, alVolver, etiquetaVolver = "Volver" }: { titulo: string; volverHref?: string; alVolver?: () => void; etiquetaVolver?: string }) {
  const clase = `inline-flex size-12 shrink-0 items-center justify-center rounded-radio-m hover:bg-fondo-sutil active:bg-fondo-sutil ${TRANSICION} ${FOCO}`;
  return (
    <header className="flex items-center gap-espacio-xs">
      {volverHref && (
        <Link href={volverHref} aria-label={etiquetaVolver} className={clase}>
          <Icono nombre="arrow-left" />
        </Link>
      )}
      {!volverHref && alVolver && (
        <button type="button" onClick={alVolver} aria-label={etiquetaVolver} className={clase}>
          <Icono nombre="arrow-left" />
        </button>
      )}
      <h1 className="text-bloque">{titulo}</h1>
    </header>
  );
}

// Stepper (Figma 3963:30555). La información está en el texto «Paso X de N»; la barra es decorativa.
export function Stepper({ actual, total, siguiente }: { actual: number; total: number; siguiente?: string }) {
  return (
    <div className="flex flex-col gap-espacio-s">
      <div className="flex items-baseline justify-between gap-espacio-s">
        <p className="text-etiqueta">
          Paso {actual} de {total}
        </p>
        {siguiente && <p className="text-pequeno text-text-muted">{siguiente}</p>}
      </div>
      <div className="flex gap-espacio-xs" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-(--duracion-media) motion-reduce:transition-none ${i < actual ? "bg-brand-primary" : "bg-borde-sutil"}`} />
        ))}
      </div>
    </div>
  );
}

// Barra de navegación (Figma 3869:28320) y Destino de navegación (3869:28219). Fija abajo en las pantallas
// principales. Seleccionado: ícono dentro de una píldora oscura y texto en texto/principal con más peso
// (no depende solo del color). Cada destino mide al menos 48 px.
export type DestinoNav = { id: string; href: string; etiqueta: string; icono: NombreIcono };

export function BarraNavegacion({ destinos, actual, etiqueta = "Principal" }: { destinos: readonly DestinoNav[]; actual: string; etiqueta?: string }) {
  return (
    <nav aria-label={etiqueta} className="shrink-0 border-t border-borde-sutil bg-surface pb-[env(safe-area-inset-bottom)]">
      <ul className="grid auto-cols-fr grid-flow-col">
        {destinos.map((d) => {
          const elegido = d.id === actual;
          return (
            <li key={d.id}>
              <Link
                href={d.href}
                aria-current={elegido ? "page" : undefined}
                className={`group flex min-h-16 flex-col items-center justify-center gap-espacio-xs rounded-radio-s p-espacio-xs text-pequeno active:bg-fondo-sutil ${TRANSICION} ${FOCO} focus-visible:-outline-offset-3 ${elegido ? "font-semibold text-text" : "text-text-muted"}`}
              >
                <span className={`inline-flex h-8 w-14 items-center justify-center rounded-radio-pill transition-colors duration-(--duracion-media) ease-estandar motion-reduce:transition-none ${elegido ? "bg-brand-primary text-brand-on-primary" : "group-hover:bg-fondo-sutil"}`}>
                  <Icono nombre={d.icono} />
                </span>
                {d.etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Fila de navegación (Figma 2737:6668): lleva a otra pantalla. Toda la fila es el objetivo táctil.
export function FilaNavegacion({ href, titulo, descripcion, icono, iniciales }: { href: string; titulo: string; descripcion?: string; icono?: NombreIcono; iniciales?: string }) {
  return (
    <Link href={href} className={`flex min-h-12 items-center gap-espacio-m rounded-radio-s px-espacio-xs py-espacio-s hover:bg-fondo-sutil active:bg-fondo-sutil ${TRANSICION} ${FOCO}`}>
      {icono && <Icono nombre={icono} />}
      {iniciales && (
        <span aria-hidden="true" className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-fondo-sutil text-pequeno font-semibold">
          {iniciales}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-etiqueta">{titulo}</span>
        {descripcion && <span className="block text-pequeno text-text-muted">{descripcion}</span>}
      </span>
      <Icono nombre="chevron-right" className="text-text-muted" />
    </Link>
  );
}

// Título de grupo (Figma 5039:73202): encabeza un bloque de contenido dentro de una pantalla.
export function TituloGrupo({ titulo, ayuda, nivel = 2 }: { titulo: string; ayuda?: string; nivel?: 2 | 3 }) {
  const T = nivel === 2 ? "h2" : "h3";
  return (
    <div>
      <T className="text-etiqueta">{titulo}</T>
      {ayuda && <p className="text-pequeno text-text-muted">{ayuda}</p>}
    </div>
  );
}

// Zona de acción (Figma 4094:25079 y 4324:53389): franja fija abajo con el botón principal de la pantalla.
export function ZonaAccion({ children }: { children: ReactNode }) {
  return <div className="shrink-0 space-y-espacio-s border-t border-borde-sutil bg-surface p-espacio-l pb-[max(1rem,env(safe-area-inset-bottom))]">{children}</div>;
}
