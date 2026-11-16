import type { Variant } from "@/lib/brand";

// Textos del Historial de quien emite (E7). Un bloque por versión (AGENTS.md sección 5).
// Marcadores: {nombres}, {hora}, {canal}, {cierre}, {fecha}. Tuteo neutro; sin "emergencia", "peligro" ni "muerte".
// El cierre de una alerta informa y acompaña: nunca celebra.
// Los textos de las filas siguen la Biblioteca (Fila de historial): "Confirmado a tiempo", "Falsa alarma", "Alerta vencida".

const COMUNES = {
  titulo: "Historial",
  hoy: "Hoy",
  ayer: "Ayer",
  // Nombre del aviso en el título de cada fila: "Rutina · Hoy".
  avisoRutina: "Rutina",
  avisoSalida: "Salida",
  avisoGeneral: "Aviso",
  // Vacío
  vacioTitulo: "Aún no hay nada en tu historial",
  vacioTexto: "Aquí verás cada vez que confirmes que estás bien y cada alerta que se haya enviado.",
  // Error de carga
  errorTitulo: "No pudimos cargar tu historial",
  errorTexto: "Revisa tu conexión e inténtalo de nuevo.",
  reintentar: "Reintentar",
  // Etiquetas de la fila (badge)
  etiquetaATiempo: "Confirmado a tiempo",
  etiquetaFalsaAlarma: "Falsa alarma",
  etiquetaVencida: "Alerta vencida",
  etiquetaEnCurso: "Alerta en curso",
  // Cuerpos
  confirmo: "Confirmaste a las {hora}. No avisamos a nadie.",
  confirmoNotificacion: "Confirmaste a las {hora} desde la notificación. No avisamos a nadie.",
  cerrada: "Avisamos a {nombres} a las {hora}{canal}. Cerraste la alerta a las {cierre}.",
  cerradaSinHora: "Avisamos a {nombres} a las {hora}{canal}. La alerta se cerró.",
  vencida: "Avisamos a {nombres}. La alerta venció el {fecha} a las {cierre} sin tu confirmación.",
  vencidaSinHora: "Avisamos a {nombres}. La alerta venció sin tu confirmación.",
  enCurso: "Avisamos a {nombres} a las {hora}{canal}. Puedes cancelarla desde Inicio.",
  tusContactos: "tus contactos",
  canalPush: " por notificación",
  canalCorreo: " por correo",
  canalAmbos: " por notificación y correo",
  vioUno: "{nombres} abrió la alerta.",
  vioVarios: "{nombres} abrieron la alerta.",
  nadieVio: "Nadie abrió la alerta.",
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
