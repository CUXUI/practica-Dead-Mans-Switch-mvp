import type { Variant } from "@/lib/brand";

// Textos de contactos e invitación desde el lado de quien emite (E5).
// Un bloque por versión (AGENTS.md sección 5). Tuteo neutro; sin "emergencia", "peligro" ni "muerte".

const COMUNES = {
  nuevo: {
    siguiente: "Siguiente: Configurar aviso",
    titulo: "Agrega un contacto",
    // El diseño dice "Solo escribirle, no instala nada."; se reescribe para que se entienda (pendiente de validar).
    texto: "Le enviaremos una invitación por correo. No tiene que instalar nada.",
    tarjetaPrimero: "Primer contacto",
    tarjetaOtro: "Nuevo contacto",
    nombre: "Nombre",
    nombreEjemplo: "Ej.: Ana Ruiz",
    correo: "Correo",
    correoEjemplo: "Ej.: ana@correo.com",
    correoAyuda: "Aquí le llegará la invitación",
    enviar: "Enviar invitación",
    enviando: "Enviando…",
    cancelar: "Cancelar",
    // Errores que el diseño no cubre (pendientes de revisar con diseño).
    errorNombre: "Escribe su nombre.",
    errorCorreo: "Escribe un correo válido, por ejemplo ana@correo.com.",
    errorRepetido: "Ya invitaste a este correo.",
    errorMaximo: "Ya tienes 5 contactos, que es el máximo.",
    errorGuardar: "No pudimos guardar el contacto. Revisa tu conexión e inténtalo de nuevo.",
  },
  lista: {
    siguiente: "Siguiente: Configurar aviso",
    enviada: "Invitación enviada",
    titulo: "Tus contactos",
    texto: "Cuando alguien acepte, te avisamos y podrás encender tu aviso.",
    pendiente: "Esperando respuesta",
    enviadaEl: "Invitación enviada",
    aceptoEl: "Aceptó",
    rechazo: "Rechazó la invitación",
    agregar: "Agregar otro contacto",
    continuar: "Continuar",
    reenviar: "Reenviar invitación",
    reenviando: "Reenviando…",
    reenviada: "Invitación reenviada.",
    // El diseño no cubre que el correo falle. Nunca se dice "enviada" si no salió.
    falloCorreo: "Guardamos el contacto, pero no pudimos enviarle la invitación por correo. Prueba a reenviarla.",
    vacio: "Todavía no agregaste contactos.",
  },
  correo: {
    asunto: (quien: string) => `${quien} te invitó a ser su contacto de confianza`,
    // PROVISIONAL: el texto definitivo de la invitación es del flujo de quien recibe (R1).
    cuerpo: (contacto: string, quien: string, app: string, enlace: string) =>
      `<p>Hola, ${contacto}:</p>` +
      `<p>${quien} te eligió como contacto de confianza en ${app}. Si un día no confirma a tiempo que está bien, te avisaremos para que puedas comunicarte con esa persona.</p>` +
      `<p>No tienes que instalar nada ni crear una cuenta.</p>` +
      `<p><a href="${enlace}">Ver la invitación</a></p>`,
  },
};

export type TextosContactos = Omit<typeof COMUNES, "correo">;
type Todo = typeof COMUNES;

const POR_VERSION: Record<Variant, Todo> = {
  cerca: COMUNES,
  montana: COMUNES,
};

export function textosContactos(variant: Variant): Todo {
  return POR_VERSION[variant];
}
