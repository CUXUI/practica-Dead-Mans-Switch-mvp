import type { Metadata } from "next";
import BarraNavegacion from "@/components/landing/BarraNavegacion";
import Pie from "@/components/landing/Pie";
import { configLanding } from "@/components/landing/config";
import { textosLanding } from "@/components/landing/textos";

// Landing pública: vive en /landing, aparte de la app. No toca la ruta "/" ni lib/brand.ts.
export const metadata: Metadata = {
  title: { absolute: configLanding.nombre },
  description: configLanding.descripcion,
};

// Solo en la landing, la acción principal es el negro del sistema (token accion-principal-pulsada) en vez del rojo,
// porque a diseño el rojo le transmite error y esta landing se va a testear con usuarios. Es un cambio local:
// no toca tailwind.css ni la app.
// brand-primary se redefine aparte porque ya viene resuelto desde :root.
const ACCION_NEGRA = {
  "--color-accion-principal": "var(--color-accion-principal-pulsada)",
  "--color-brand-primary": "var(--color-accion-principal-pulsada)",
} as React.CSSProperties;

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={ACCION_NEGRA}>
      <a
        href="#contenido"
        className="sr-only z-20 rounded-xl bg-surface px-4 py-3 font-bold focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {textosLanding.saltarAlContenido}
      </a>
      <BarraNavegacion />
      <main id="contenido">{children}</main>
      <Pie />
    </div>
  );
}
