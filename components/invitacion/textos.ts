import type { Variant } from "@/lib/brand";

// Textos del flujo "Aceptar ser contacto" (R1). Viven aquí y hay un bloque por versión
// (AGENTS.md sección 5). Hoy las dos versiones dicen lo mismo; cuando cambie una, se edita
// solo su bloque. Tono: informa y acompaña; nunca "emergencia", "peligro" ni "muerte".
// Tuteo neutro. Los datos del sistema llegan como parámetros (nombre de quien emite, correo).

function comunes(appName: string) {
  return {
    invitacion: {
      titulo: (emisor: string) => `${emisor} te pidió ser su contacto de confianza`,
      intro: (emisor: string) =>
        `${emisor} usa ${appName} para que una persona de confianza reciba una alerta si un día no confirma que está bien.`,
      implicaTitulo: "Qué implica",
      implica: (emisor: string) => [
        "Mientras todo va bien, no recibes nada.",
        `Si ${emisor} no confirma, te llega una alerta por correo.`,
        "La llamada la haces tú. La app no llama ni envía mensajes por ti.",
        "No instalas nada ni creas cuenta.",
      ],
      notaSinConfirmar:
        "Que no confirme no significa que le haya pasado algo: puede ser falta de batería o de señal.",
      dudasTitulo: "Dudas frecuentes",
      dudas: (emisor: string) => [
        {
          pregunta: `¿Qué datos de ${emisor} voy a ver?`,
          respuesta:
            "Solo lo esencial: su nombre y teléfono, y su hora de confirmación y hora límite. No ves su ubicación.",
        },
        {
          pregunta: "¿Puedo dejar de ser contacto después?",
          respuesta: `Sí. Desde cualquier correo que te enviemos puedes dejar de ser contacto de ${emisor} cuando quieras.`,
        },
      ],
      aceptar: "Aceptar",
      rechazar: "No puedo",
      enviando: "Enviando…",
      aclaracion: `${appName} sirve para avisar a personas de confianza. Si algo te preocupa ahora, llama primero a la persona directamente.`,
      errorEnvio: "No pudimos registrar tu respuesta. Revisa tu conexión e inténtalo de nuevo.",
    },
    acepto: {
      titulo: (emisor: string) => `Ya eres contacto de ${emisor}`,
      cuerpo: (emisor: string) => [
        "Mientras todo vaya bien, no recibirás nada.",
        `Solo te escribiremos si vence la hora límite y el tiempo de gracia sin que ${emisor} confirme.`,
      ],
      correo: (correo: string) => `Te avisaremos por correo a ${correo}.`,
      emisorAvisado: (emisor: string) => `Le avisamos a ${emisor} que aceptaste.`,
    },
    rechazo: {
      titulo: (emisor: string) => `De acuerdo, no serás contacto de ${emisor}`,
      cuerpo: (emisor: string) => `Le avisaremos a ${emisor}.`,
    },
    yaEsContacto: {
      titulo: (emisor: string) => `Ya eres contacto de ${emisor}`,
      cuerpo: "No hace falta que hagas nada más.",
    },
    inactiva: {
      titulo: "Esta invitación ya no está activa",
      cuerpo: "Pídele a quien te invitó que te invite de nuevo.",
    },
    // Pie de todas las pantallas web. TODO: crear las rutas /preguntas-frecuentes y /ayuda (no existen todavía).
    pie: {
      preguntas: "Preguntas frecuentes",
      preguntasHref: "/preguntas-frecuentes",
      ayuda: "Ayuda",
      ayudaHref: "/ayuda",
    },
    cargando: "Cargando tu invitación…",
    errorCarga: {
      titulo: "No pudimos abrir la invitación",
      cuerpo: "Revisa tu conexión e inténtalo de nuevo.",
      reintentar: "Reintentar",
    },
  };
}

export type TextosInvitacion = ReturnType<typeof comunes>;

export function textosInvitacion(variant: Variant, appName: string): TextosInvitacion {
  const porVersion: Record<Variant, TextosInvitacion> = {
    cerca: comunes(appName),
    montana: comunes(appName),
  };
  return porVersion[variant];
}
