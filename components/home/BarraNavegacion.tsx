import Link from "next/link";
import type { TextosInicio } from "./textosInicio";

// Barra de navegación de quien emite: Inicio · Contactos · Historial · Ajustes.
// Norma de la biblioteca: fija abajo en esas cuatro pantallas; destino = icono + texto, mínimo 48 px.
// No va en flujos de pasos ni en la web de quien recibe.
const ICONOS = {
  inicio: "M3 11.5 12 4l9 7.5M5 10v10h5v-6h4v6h5V10",
  contactos: "M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM21 20v-1.5a4 4 0 0 0-3-3.85M15.5 4.15a3.5 3.5 0 0 1 0 6.7",
  historial: "M12 7v5l3 2M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9Z",
  ajustes: "M4 6h10M18 6h2M4 12h4M12 12h8M4 18h10M18 18h2M16 4v4M10 10v4M16 16v4",
} as const;

export type Destino = keyof typeof ICONOS;

export default function BarraNavegacion({ t, actual }: { t: TextosInicio["nav"]; actual: Destino }) {
  // CONEXIÓN · Historial y Ajustes (E7 y la cuenta) son de otro flujo y no van en este PR: las rutas
  // /historial y /ajustes darán 404 hasta que lleguen.
  const destinos = [
    { id: "inicio", href: "/home", label: t.inicio },
    { id: "contactos", href: "/contactos", label: t.contactos },
    { id: "historial", href: "/historial", label: t.historial },
    { id: "ajustes", href: "/ajustes", label: t.ajustes },
  ] as const;
  return (
    <nav aria-label="Principal" className="shrink-0 border-t border-border/40 bg-surface">
      <ul className="grid grid-cols-4">
        {destinos.map((d) => (
          <li key={d.id}>
            <Link
              href={d.href}
              aria-current={d.id === actual ? "page" : undefined}
              className="flex min-h-14 flex-col items-center justify-center gap-0.5 py-1.5 text-xs font-medium text-text-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-primary aria-[current=page]:font-bold aria-[current=page]:text-brand-primary"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={d.id === actual ? 2.25 : 1.75} strokeLinecap="round" strokeLinejoin="round">
                <path d={ICONOS[d.id]} />
              </svg>
              {d.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
