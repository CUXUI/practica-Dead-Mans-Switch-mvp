import type { Metadata } from "next";
import Link from "next/link";
import { getBrand } from "@/lib/brand";
import { MarcaApp } from "@/components/ds/Navegacion";
import { FOCO } from "@/components/ds/estilos";
import NavDS from "./_ui/NavDS";
import SelectorTema from "./_ui/SelectorTema";

// Documentación viva del design system. Es parte de la misma app: usa los mismos tokens y los mismos
// componentes que el producto, así que lo que se ve aquí es lo que está en producción.
export const metadata: Metadata = {
  title: { default: "Design system", template: "%s · Design system" },
  description: "Tokens, componentes y temas de marca del producto, con ejemplos que funcionan.",
};

export default function LayoutDS({ children }: { children: React.ReactNode }) {
  const marca = getBrand();
  return (
    <div className="min-h-dvh bg-surface-muted text-text">
      <a href="#contenido" className={`sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-radio-s focus:bg-surface focus:px-espacio-l focus:py-espacio-s ${FOCO}`}>
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-40 border-b border-borde-sutil bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-espacio-m px-espacio-l py-espacio-s">
          <Link href="/design-system" className={`inline-flex min-h-12 items-center gap-espacio-s rounded-radio-s ${FOCO}`}>
            <MarcaApp nombre={marca.name} mostrarNombre={false} />
            <span className="text-etiqueta">Design system</span>
          </Link>
          <SelectorTema compacto />
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-espacio-xl px-espacio-l py-espacio-xl lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-espacio-seccion">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <NavDS />
        </aside>
        <main id="contenido" className="min-w-0 pb-espacio-seccion">
          {children}
        </main>
      </div>
    </div>
  );
}
