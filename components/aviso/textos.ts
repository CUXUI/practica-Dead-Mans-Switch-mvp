import type { Variant } from "@/lib/brand";

// Textos de "Configura tu aviso" y "Revisa tu aviso" (E3, E4, E5, R6).
// Un bloque por versión (AGENTS.md sección 5). Sin funciones: se pasan a componentes de cliente.
// Marcadores: {nombres}, {primero}, {resto}, {n}.

const COMUNES = {
  titulo: "Configura tu aviso",
  hora: {
    titulo: "Hora del aviso",
    ayuda: "Antes de esta hora confirmas que estás bien.",
    errorPasada: "Esa hora ya pasó. Elige una hora más tarde.",
    frecuencia: "Frecuencia",
    soloHoy: "Solo hoy",
    aDiario: "A diario",
    elegirDias: "Elegir días",
    gracia: "Tiempo de gracia",
    otro: "Otro",
    otroHoras: "Horas",
    otroMinutos: "Minutos",
    graciaAyuda: "Si no confirmas a la hora, esperamos este tiempo antes de avisar a tus contactos.",
    mensaje: "Mensaje",
    // Errores que el diseño no cubre (pendientes de revisar con diseño).
    errorDias: "Elige al menos un día.",
    errorGracia: "Elige entre 15 min y 24 h.",
  },
  pasos: {
    titulo: "Pasos a seguir",
    texto: "Tus contactos verán estos pasos si no confirmas que estás bien.",
    etiqueta: "Paso {n}",
    anadir: "Añadir paso",
    quitar: "Quitar paso {n}",
    errorVacio: "Escribe el paso",
    errorNinguno: "Añade al menos un paso.",
  },
  contactos: {
    titulo: "¿A quién avisamos?",
    ordenUno: "Si no confirmas, avisamos a {primero}.",
    ordenVarios: "Si no confirmas, avisamos primero a {primero} y luego a {resto}.",
    quitar: "Quitar de este aviso",
    anadir: "Añadir a este aviso",
    otros: "Otros contactos",
    subir: "Subir a {nombres}",
    bajar: "Bajar a {nombres}",
    errorNinguno: "Añade al menos un contacto a este aviso.",
    sinContactos: "Todavía no tienes contactos.",
    agregarContacto: "Agregar contacto",
  },
  resumen: {
    titulo: "Revisa tu aviso",
    esperando: "Esperando contactos",
    // Corrige la errata del diseño ("esta" sin tilde).
    apagado: "Tu aviso está apagado",
    podras: "Podrás encenderlo cuando al menos un contacto acepte.",
    aunNoUno: "{nombres} aún no responde.",
    aunNoVarios: "{nombres} aún no responden.",
    tuAviso: "Tu aviso",
    frecuencia: "Frecuencia",
    hora: "Hora del aviso",
    gracia: "Tiempo de gracia",
    contactos: "Contactos invitados",
    pasos: "Pasos a seguir",
    mensaje: "Mensaje",
    guardar: "Guardar",
    guardando: "Guardando…",
    errorGuardar: "No pudimos guardar tu aviso. Revisa tu conexión e inténtalo de nuevo.",
    errorEncendido: "Tu aviso está encendido. Para cambiarlo, primero apágalo.",
  },
  continuar: "Continuar",
  revisar: "Revisar aviso",
};

export type TextosAviso = typeof COMUNES;

const POR_VERSION: Record<Variant, TextosAviso> = {
  cerca: COMUNES,
  montana: COMUNES,
};

export function textosAviso(variant: Variant): TextosAviso {
  return POR_VERSION[variant];
}

export function rellenar(plantilla: string, valores: Record<string, string | number>) {
  return plantilla.replace(/\{(\w+)\}/g, (_, k: string) => String(valores[k] ?? ""));
}
