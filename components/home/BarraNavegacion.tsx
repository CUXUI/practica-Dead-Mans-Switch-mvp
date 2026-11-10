import Link from "next/link";
import type { TextosInicio } from "./textosInicio";

// Barra de navegación de quien emite: Inicio · Contactos · Historial · Ajustes.
// Historial (/historial) y Ajustes (/ajustes) todavía no existen.
export default function BarraNavegacion({ t, actual }: { t: TextosInicio["nav"]; actual: "inicio" | "contactos" }) {
  const destinos = [
    { id: "inicio", href: "/home", label: t.inicio },
    { id: "contactos", href: "/contactos", label: t.contactos },
    { id: "historial", href: "/historial", label: t.historial },
    { id: "ajustes", href: "/ajustes", label: t.ajustes },
  ] as const;
  return (
    <nav aria-label="Principal" className="sticky bottom-0 border-t border-border/40 bg-surface">
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {destinos.map((d) => (
          <li key={d.id}>
            <Link
              href={d.href}
              aria-current={d.id === actual ? "page" : undefined}
              className="flex min-h-14 items-center justify-center text-sm font-medium text-text-muted aria-[current=page]:font-semibold aria-[current=page]:text-text"
            >
              {d.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
