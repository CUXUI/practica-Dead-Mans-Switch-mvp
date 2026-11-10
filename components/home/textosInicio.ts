import type { Variant } from "@/lib/brand";

// Textos del Inicio de quien emite con el aviso apagado (E · Inicio · Esperando contactos).
// Un bloque por versión (AGENTS.md sección 5). Marcadores: {nombre}, {nombres}.

const COMUNES = {
  hola: "Hola, {nombre}",
  holaSinNombre: "Hola",
  esperando: "Esperando contactos",
  apagado: "Apagado",
  editar: "Editar",
  editarAria: "Editar tu aviso",
  tuAviso: "Tu aviso",
  podras: "Podrás encender tu aviso cuando al menos un contacto acepte.",
  aunNoUno: "{nombres} aún no responde.",
  aunNoVarios: "{nombres} aún no responden.",
  verContactos: "Ver contactos",
  nav: { inicio: "Inicio", contactos: "Contactos", historial: "Historial", ajustes: "Ajustes" },
};

export type TextosInicio = typeof COMUNES;

const POR_VERSION: Record<Variant, TextosInicio> = {
  cerca: COMUNES,
  montana: COMUNES,
};

export function textosInicio(variant: Variant): TextosInicio {
  return POR_VERSION[variant];
}
