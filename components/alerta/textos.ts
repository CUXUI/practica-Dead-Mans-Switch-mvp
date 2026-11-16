import type { Variant } from "@/lib/brand";

// Textos de la pantalla de la alerta para quien recibe (flujo 5, R2 a R7).
// Hay un bloque por versión (AGENTS.md sección 5). Hoy las dos dicen lo mismo.
// Tono: informa y acompaña; nunca "emergencia", "peligro" ni "muerte". Tuteo neutro.
// Nunca celebrar un cierre.

// Termina la frase con punto, salvo que ya lo tenga (p. ej. "8:00 p. m.").
function oracion(s: string): string {
  return s.endsWith(".") ? s : `${s}.`;
}

const COMUNES = {
  etiquetaAbierta: "Alerta abierta",
  etiquetaEnviada: "Alerta enviada",
  etiquetaAlguienLaVio: "Alguien ya la vio",
  etiquetaSinRespuesta: "Sin respuesta confirmada",
  alguienLaVioCuerpo: (nombre: string) =>
    `Otra persona de confianza ya abrió esta alerta sobre ${nombre}. Si podés, confirmá con esa persona qué está pasando.`,
  enviadaCuerpo: "Todavía nadie la abrió. Si podés, llamá o escribile ahora.",
  sinRespuesta: "Sin respuesta confirmada",
  causasTitulo: "Puede que esté sin batería, sin señal o con el teléfono en silencio.",
  abiertaHace: (minutos: number) => `Abierta hace ${minutos} min`,
  ultimaSenal: (cuando: string) => oracion(`Su última confirmación fue ${cuando}`),
  debiaConfirmar: (hora: string) => oracion(`Debía confirmar a las ${hora}`),
  llamar: (nombre: string) => `Llamar a ${nombre}`,
  whatsapp: (nombre: string) => `Escribir a ${nombre} por WhatsApp`,
  mensajeWhatsapp: (nombre: string) =>
    `Hola ${nombre}, vi la alerta de Dead Man's Switch. ¿Estás bien?`,
  pasosTitulo: (nombre: string) => `Qué hacer, según ${nombre}`,
  pasosSubtitulo: (nombre: string) => `${nombre} dejó estos pasos para ti.`,
  sinPasos: "No dejó pasos. Puedes llamar o escribir.",
  textoFijoTitulo: "Qué hacer en cualquier caso",
  cerradaTitulo: "La alerta se cerró",
  cerradaCuerpo: (nombre: string) =>
    `${nombre} confirmó que está bien o canceló una falsa alarma. No hace falta que hagas nada más.`,
  sinResolverTitulo: "La alerta venció sin resolverse",
  sinResolverCuerpo: (nombre: string) =>
    `Nadie cerró esta alerta a tiempo, así que se avisó a todos los contactos. Te sugerimos comunicarte con ${nombre}.`,
  pieSistema:
    "Recibiste este aviso porque la persona te eligió como contacto de confianza. No se llamó ni se envió nada automáticamente.",
};

export type TextosAlerta = typeof COMUNES;

// Texto fijo de la organización (R6): se muestra debajo de los pasos de quien emite.
// PREGUNTA ABIERTA: el texto lo define cada organización. Mientras esté en null, no se muestra.
const TEXTO_FIJO_CERCA: string | null = null;
const TEXTO_FIJO_MONTANA: string | null = null;

const POR_VERSION: Record<Variant, TextosAlerta & { textoFijo: string | null }> = {
  cerca: { ...COMUNES, textoFijo: TEXTO_FIJO_CERCA },
  montana: { ...COMUNES, textoFijo: TEXTO_FIJO_MONTANA },
};

export function textosAlerta(variant: Variant): TextosAlerta & { textoFijo: string | null } {
  return POR_VERSION[variant];
}
