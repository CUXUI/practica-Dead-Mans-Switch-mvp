import type { Variant } from "@/lib/brand";

// Textos del onboarding de quien emite (Figma: Wireflows stakeholder · 01 Alta e instalación).
// Un bloque por versión (AGENTS.md sección 5). Tuteo neutro; sin "emergencia", "peligro" ni "muerte".

const COMUNES = {
  comienzo: {
    titulo: "Tu cuenta está lista. Falta poco.",
    intro: "Vamos a dejar tu aviso listo en 3 pasos. Toma menos de 5 minutos.",
    pasos: [
      { titulo: "Activa las notificaciones", texto: "Así te recordamos confirmar a tiempo." },
      { titulo: "Elige a tus contactos", texto: "Quienes recibirán la alerta por correo." },
      { titulo: "Configura tu primer aviso", texto: "Hora, tiempo de gracia y mensaje." },
    ],
    empezar: "Empezar",
  },
  notificaciones: {
    siguiente: "Siguiente: Contactos",
    titulo: "Activa las notificaciones",
    texto: "Así te recordamos confirmar a tiempo y te enteras si hay una alerta.",
    activar: "Activar notificaciones",
    activando: "Activando…",
    ahoraNo: "Ahora no",
    activasBadge: "Activas",
    activasTitulo: "Notificaciones activas",
    activasTexto: "Te avisaremos cuando sea hora de confirmar que estás bien.",
    continuar: "Continuar",
    noTitulo: "Las notificaciones están desactivadas",
    noTexto:
      "Sin ellas puede que no confirmes a tiempo y se avise a tus contactos. Actívalas desde los ajustes del teléfono.",
    noNota:
      "Podrás activarlas después desde Ajustes. Mientras tanto, tu aviso empieza apagado y no podremos recordarte confirmar.",
    // PREGUNTA ABIERTA: el diseño dice "Abrir ajustes del teléfono", pero una web no puede abrir los ajustes.
    // Mientras se decide, el botón vuelve a pedir el permiso.
    reintentar: "Volver a intentarlo",
    continuarSin: "Continuar sin notificaciones",
    // Textos técnicos que el diseño no cubre (pendientes de revisar con diseño).
    bloqueado:
      "Tu navegador tiene bloqueadas las notificaciones para esta web. Actívalas en sus ajustes y vuelve a intentarlo.",
    noCompatible:
      "Este navegador no permite notificaciones. En iPhone, primero agrega la app a la pantalla de inicio.",
    errorGuardar: "No pudimos activar las notificaciones. Revisa tu conexión e inténtalo de nuevo.",
  },
};

export type TextosAlta = typeof COMUNES;

const POR_VERSION: Record<Variant, TextosAlta> = {
  cerca: COMUNES,
  montana: COMUNES,
};

export function textosAlta(variant: Variant): TextosAlta {
  return POR_VERSION[variant];
}
