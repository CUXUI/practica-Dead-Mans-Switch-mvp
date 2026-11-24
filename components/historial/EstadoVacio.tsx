import type { ReactNode } from "react";

// Estado vacío (Biblioteca · 05): ícono en círculo de 48 px, título de sección 24/32 en negrita,
// texto de 16/24 que dice qué pasará, todo centrado, con relleno de 32.
export default function EstadoVacio({ icono, titulo, texto }: { icono: ReactNode; titulo: string; texto: string }) {
  return (
    <section className="flex flex-col items-center gap-espacio-s p-espacio-2xl text-center">
      <span aria-hidden="true" className="inline-flex size-12 items-center justify-center rounded-[var(--spacing-radio-pill)] bg-fondo-sutil">
        {icono}
      </span>
      <h2 className="text-seccion leading-8">{titulo}</h2>
      <p className="text-base leading-6 text-text-muted">{texto}</p>
    </section>
  );
}
