import { BarraNavegacion as BarraDS, type DestinoNav } from "@/components/ds/Navegacion";
import type { TextosInicio } from "./textosInicio";

// Barra de navegación de quien emite: Inicio · Contactos · Historial · Ajustes.
// Es la Barra de navegación del design system (components/ds/Navegacion.tsx) con los destinos del producto.
// Norma de la biblioteca: fija abajo en esas cuatro pantallas. No va en flujos de pasos ni en la web de quien recibe.
export type Destino = "inicio" | "contactos" | "historial" | "ajustes";

export default function BarraNavegacion({ t, actual }: { t: TextosInicio["nav"]; actual: Destino }) {
  const destinos: DestinoNav[] = [
    { id: "inicio", href: "/home", etiqueta: t.inicio, icono: "house" },
    { id: "contactos", href: "/contactos", etiqueta: t.contactos, icono: "users" },
    { id: "historial", href: "/historial", etiqueta: t.historial, icono: "list" },
    { id: "ajustes", href: "/ajustes", etiqueta: t.ajustes, icono: "settings" },
  ];
  return <BarraDS destinos={destinos} actual={actual} />;
}
