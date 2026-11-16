import type { Variant } from "@/lib/brand";

// Textos del Historial de quien emite (E7). Un bloque por versión (AGENTS.md sección 5).
// Marcadores: {nombres}, {nombre}. Tuteo neutro; sin "emergencia", "peligro" ni "muerte".
// El cierre de una alerta informa y acompaña: nunca celebra.

const COMUNES = {
  titulo: "Historial",
  hoy: "Hoy",
  ayer: "Ayer",
  // Vacío
  vacioTitulo: "Aún no hay nada en tu historial",
  vacioTexto: "Aquí verás cada vez que confirmes que estás bien y cada alerta que se haya enviado.",
  // Error de carga
  errorTitulo: "No pudimos cargar tu historial",
  errorTexto: "Revisa tu conexión e inténtalo de nuevo.",
  reintentar: "Reintentar",
  // Confirmaciones
  confirmacion: "Confirmaste que estabas bien",
  origenApp: "Desde la app",
  origenNotificacion: "Desde la notificación",
  // Alertas
  alerta: "Alerta enviada",
  avisamosA: "Avisamos a {nombres}",
  avisamosNadie: "No hay contactos registrados para esta alerta.",
  porPush: "por notificación",
  porCorreo: "por correo",
  noLlego: "no llegó",
  vioUno: "{nombres} abrió la alerta.",
  vioVarios: "{nombres} abrieron la alerta.",
  nadieVio: "Nadie abrió la alerta.",
  // Cómo terminó
  enCurso: "En curso",
  cerrada: "Cerrada: confirmaste que estás bien.",
  sinResolver: "Sin resolver: venció sin una respuesta confirmada. Avisamos a tus contactos.",
  // Pie de la lista
  limite: "Se muestran los últimos {n} movimientos.",
  cargando: "Cargando tu historial…",
};

export type TextosHistorial = typeof COMUNES;

const POR_VERSION: Record<Variant, TextosHistorial> = {
  cerca: { ...COMUNES },
  montana: { ...COMUNES },
};

export function textosHistorial(variant: Variant): TextosHistorial {
  return POR_VERSION[variant];
}
