"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FOCO } from "@/components/ds/estilos";

export const SECCIONES = [
  { href: "/design-system", texto: "Inicio" },
  { href: "/design-system/fundamentos", texto: "Fundamentos" },
  { href: "/design-system/componentes", texto: "Componentes" },
  { href: "/design-system/temas", texto: "Temas de marca" },
  { href: "/design-system/producto", texto: "En el producto" },
  { href: "/design-system/estado", texto: "Estado y enlaces" },
] as const;

export default function NavDS() {
  const ruta = usePathname();
  return (
    <nav aria-label="Secciones del design system" className="-mx-espacio-l overflow-x-auto px-espacio-l lg:mx-0 lg:overflow-visible lg:px-0">
      <ul className="flex gap-espacio-xs lg:flex-col">
        {SECCIONES.map((s) => {
          const actual = s.href === "/design-system" ? ruta === s.href : ruta.startsWith(s.href);
          return (
            <li key={s.href} className="shrink-0">
              <Link
                href={s.href}
                aria-current={actual ? "page" : undefined}
                className={`flex min-h-12 items-center rounded-radio-s px-espacio-m text-cuerpo transition-colors duration-(--duracion-rapida) motion-reduce:transition-none ${FOCO} ${actual ? "bg-fondo-inverso font-semibold text-inverso" : "text-text hover:bg-fondo-sutil"}`}
              >
                {s.texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
