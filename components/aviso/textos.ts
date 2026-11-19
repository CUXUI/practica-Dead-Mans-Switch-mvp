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
    // Selector de hora propio (siempre en 12 h, igual en todos los navegadores).
    selHora: "Hora",
    selMinutos: "Minutos",
    selMomento: "a. m. o p. m.",
    otroMinutos: "Minutos",
    graciaAyuda: "Si no confirmas a la hora, esperamos este tiempo antes de avisar a tus contactos.",
    // Aclara el rango de "Otro" para que ninguna opción parezca rota. Marcadores: {min}, {max}.
    graciaRango: "El tiempo debe estar entre {min} y {max}.",
    // Pruebas del 12/11: 5 de 9 no entendieron para qué es el campo ni quién lo recibe.
    // La ayuda y el ejemplo van FUERA del campo (un placeholder desaparece al escribir y se lee peor).
    mensaje: "Mensaje para tus contactos",
    opcional: "(opcional)",
    mensajeAyuda: "Lo reciben con la alerta, solo si no confirmas a tiempo.",
    mensajeEjemplo: "Ejemplo: \"Estaré en casa de mi hermana\".",
    // Errores que el diseño no cubre (pendientes de revisar con diseño).
    errorDias: "Elige al menos un día.",
    errorGracia: "Elige entre 15 min y 24 h.",
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
    // E-04 · Contactos: "Esperando que acepte la invitación. Podrás añadirla cuando acepte." (sin género).
    pendiente: "Esperando que acepte la invitación. Podrás añadir al contacto cuando acepte.",
    sinEnviar: "Invitación sin enviar",
    // Contactos que se dieron de baja desde su correo.
    salioUno: "{nombres} dejó de ser tu contacto y ya no recibirá avisos.",
    salioVarios: "{nombres} dejaron de ser tus contactos y ya no recibirán avisos.",
    soloAceptados: "Solo avisamos a quien aceptó tu invitación.",
    nadieAcepto: "Todavía nadie aceptó tu invitación. Hasta entonces no podemos avisar a nadie.",
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
    // PRD 12/11: contactos y pasos visibles sin abrir nada. Los pasos son los contactos en orden,
    // así que van en una sola lista numerada, cada uno con su estado.
    pasos: "Contactos y pasos a seguir",
    pasosTexto: "Si no confirmas, avisamos en este orden. Solo a quien aceptó tu invitación.",
    pasoPrimero: "Avisamos a {nombre}",
    pasoSiguiente: "Si no responde, avisamos a {nombre}",
    acepto: "Aceptó",
    pendiente: "Aún no aceptó: no recibirá el aviso",
    sinEnviar: "Invitación sin enviar: no recibirá el aviso",
    noEnviadaUno: "La invitación de {nombres} no se envió. Envíala desde Contactos.",
    noEnviadaVarios: "Las invitaciones de {nombres} no se enviaron. Envíalas desde Contactos.",
    mensaje: "Mensaje para tus contactos",
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
