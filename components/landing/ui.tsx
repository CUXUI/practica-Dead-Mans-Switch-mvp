import Link from "next/link";
import type { ReactNode } from "react";
import { configLanding, RUTA_LANDING } from "@/components/landing/config";
import { textosLanding } from "@/components/landing/textos";
import { boton, enlace } from "@/components/ds/estilos";

// Piezas visuales compartidas de la landing. Solo usan tokens del sistema de diseño.

const ENFOQUE =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary";

// Estados (solo tokens del sistema): al pasar el mouse el negro se aclara un paso (fondo-inverso) y al
// presionar vuelve al negro más oscuro (negro). Los secundarios se rellenan con fondo-sutil / gris-200.
const TRANSICION = "transition-colors motion-reduce:transition-none";

export const estiloBotonPrincipal = boton.principalAjustado;
export const estiloBotonSecundario = boton.secundarioAjustado;
export const estiloEnlaceTexto = enlace;
// Insignia (badge) neutra de la barra de navegación.
// Insignia seleccionada: borde grueso oscuro con fondo claro (no se parece al botón Instalar, que es negro macizo).
export const estiloInsigniaSeleccionada = `inline-flex min-h-12 items-center rounded-full border-2 border-fondo-inverso bg-surface px-4 font-semibold text-text hover:bg-fondo-sutil active:bg-gris-200 ${TRANSICION} ${ENFOQUE}`;
export const estiloInsignia = `inline-flex min-h-12 items-center rounded-full border-2 border-borde-sutil bg-fondo-sutil px-4 font-semibold text-text hover:bg-gris-200 hover:border-border active:bg-gris-200 ${TRANSICION} ${ENFOQUE}`;

/** Marcador de posición del logo: círculo con la inicial, como en el resto de la app. */
export function Logo({ conNombre = true }: { conNombre?: boolean }) {
  const { nombre } = configLanding;
  return (
    <span className="inline-flex items-center gap-2 text-tarjeta">
      <span
        aria-hidden="true"
        className="inline-flex size-8 items-center justify-center rounded-full bg-brand-primary text-brand-on-primary"
      >
        {nombre.slice(0, 1)}
      </span>
      {conNombre && <span>{nombre}</span>}
    </span>
  );
}

export function EnlaceAlInicio() {
  return (
    <Link
      href={RUTA_LANDING}
      aria-label={textosLanding.navegacion.irAlInicio(configLanding.nombre)}
      className={`inline-flex min-h-12 items-center rounded-lg ${ENFOQUE}`}
    >
      <Logo />
    </Link>
  );
}

/** Contenedor de sección: separación de 48 px entre secciones y 16 px de margen lateral. */
export function Seccion({
  id,
  titulo,
  fondo = "lienzo",
  children,
}: {
  id?: string;
  titulo: string;
  fondo?: "lienzo" | "superficie" | "sutil";
  children: ReactNode;
}) {
  const color = { lienzo: "bg-surface-muted", superficie: "bg-surface", sutil: "bg-fondo-sutil" }[fondo];
  const idTitulo = id ? `${id}-titulo` : undefined;
  return (
    <section id={id} aria-labelledby={idTitulo} className={`scroll-mt-20 ${color}`}>
      <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <h2 id={idTitulo} className="text-seccion leading-8 md:text-3xl">
          {titulo}
        </h2>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}
