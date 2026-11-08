import type { Variant } from "@/lib/brand";

// Textos de la cancelación de una falsa alarma (E6). Viven aquí y hay un bloque por versión
// (AGENTS.md sección 5). Hoy las dos versiones dicen lo mismo; cuando cambie una, se edita
// solo su bloque. Tono: informa y acompaña; nunca "emergencia", "peligro" ni "muerte".
// Tuteo neutro. Nunca decir que algo quedó hecho si el servidor no lo confirmó (E1).

const COMUNES = {
  alertaTitulo: "Tienes una alerta en curso",
  alertaCuerpo:
    "No registramos tu confirmación a tiempo. Si fue una falsa alarma y estás bien, puedes cancelarla.",
  boton: "Estoy bien, cancelar alerta",
  ayudaMantener: "Mantén presionado el botón durante 2 segundos.",
  confirmarPregunta: "¿Confirmas que estás bien y quieres cancelar la alerta?",
  confirmarSi: "Sí, cancelar alerta",
  volver: "Volver",
  enviando: "Cancelando la alerta…",
  errorGenerico: "No se pudo cancelar la alerta. Revisa tu conexión e inténtalo de nuevo.",
  canceladaTitulo: "Cancelaste la alerta",
  canceladaCuerpo: "Tu confirmación quedó registrada.",
};

export type TextosHome = typeof COMUNES;

const POR_VERSION: Record<Variant, TextosHome> = {
  cerca: { ...COMUNES },
  montana: { ...COMUNES },
};

export function textosHome(variant: Variant): TextosHome {
  return POR_VERSION[variant];
}
