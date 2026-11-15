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
    // E-06 del wireflow (fuera del alta): título, relación y mensaje de invitación.
    tituloFuera: "Agregar contacto",
    nombre: "Nombre",
    nombreEjemplo: "Ej.: Ana Ruiz",
    nombreAyuda: "Nombre y apellido.",
    relacion: "Relación",
    opcional: "(opcional)",
    relacionEjemplo: "Ej.: Pareja, vecina, hijo",
    relacionAyuda: "Así reconocerás a esta persona en tu lista.",
    correo: "Correo electrónico",
    correoEjemplo: "Ej.: ana@correo.com",
    correoAyuda: "Le llegará la invitación a este correo.",
    mensaje: "Mensaje de invitación",
    general: "General",
    personalizado: "Personalizado",
    generalAyuda: "Le explicamos qué es ser tu contacto y cómo aceptar.",
    tuMensaje: "Tu mensaje",
    tuMensajeAyuda: "Lo verá en el correo, antes de la explicación.",
    errorMensaje: "Escribe tu mensaje o elige General.",
    enviar: "Enviar invitación",
    enviando: "Enviando…",
    cancelar: "Cancelar",
    // Errores que el diseño no cubre (pendientes de revisar con diseño).
    errorNombre: "Escribe el nombre del contacto.",
    errorCorreo: "Escribe un correo válido, como ana@correo.com.",
    errorRepetido: "Ya invitaste a este correo.",
    errorMaximo: "Ya tienes 5 contactos, el máximo. Quita uno para invitar a otra persona.",
    errorGuardar: "No pudimos guardar el contacto. Revisa tu conexión e inténtalo de nuevo.",
  },
  // E-17 del wireflow, sin la pantalla de Detalle (E-16): se llega desde "Editar" en la lista.
  editar: {
    titulo: "Editar contacto",
    // {nombre} es el primer nombre del contacto.
    correoAyuda: "Si lo cambias, {nombre} tendrá que aceptar otra vez.",
    // Quien todavía no aceptó no tiene que aceptar "otra vez".
    correoAyudaPendiente: "Si lo cambias, enviaremos la invitación al correo nuevo.",
    correoAyudaApaga: "Si lo cambias, {nombre} tendrá que aceptar otra vez y tu aviso se apagará hasta que acepte.",
    guardar: "Guardar cambios",
    guardando: "Guardando…",
    errorGuardar: "No pudimos guardar los cambios. Revisa tu conexión e inténtalo otra vez.",
    errorAlerta: "Tu aviso tiene una alerta en curso. Podrás cambiar el correo cuando la canceles.",
    noExiste: "Este contacto ya no está en tu lista.",
  },
  // E-16 · Detalle del contacto.
  detalle: {
    titulo: "Detalle del contacto",
    noRecibira: "No recibirá tus alertas",
    salioSub: "Dejó de ser tu contacto",
    aceptoEl: "Aceptó",
    invitacionEnviada: "Invitación enviada",
    sinEnviar: "Invitación sin enviar",
    correo: "Correo",
    ordenAviso: "Orden de aviso",
    // Orden de aviso según la posición del contacto en el aviso. Si no está en el aviso: "Sin asignar".
    orden: ["Primer contacto", "Segundo contacto", "Tercer contacto", "Cuarto contacto", "Quinto contacto"],
    sinOrden: "Fuera de tu aviso",
    mensaje: "Mensaje de invitación",
    general: "General",
    editarContacto: "Editar contacto",
    quitarInvitacion: "Quitar invitación",
    quitarContacto: "Quitar contacto",
    noExiste: "Este contacto ya no está en tu lista.",
  },
  lista: {
    editar: "Editar",
    guardado: "Cambios guardados",
    correoNuevo: "Cambios guardados. Enviamos una invitación al correo nuevo.",
    siguiente: "Siguiente: Configurar aviso",
    enviada: "Invitación enviada. Le llegará un correo con el enlace.",
    titulo: "Tus contactos",
    // Sin "te avisamos": hoy no se avisa al emisor cuando alguien acepta (pedido al núcleo).
    texto: "Cuando alguien acepte, podrás encender tu aviso.",
    textoAceptado: "Si no confirmas a tiempo, avisamos a los contactos de tu aviso.",
    pendiente: "Esperando respuesta",
    enviadaEl: "Invitación enviada",
    aceptoEl: "Aceptó",
    rechazo: "Rechazó la invitación",
    // E-05 del wireflow: título "Contactos", botón "Agregar contacto" en singular.
    tituloPantalla: "Contactos",
    agregar: "Agregar contacto",
    agregarOtro: "Agregar otro contacto", // en el alta, junto a "Continuar"
    estadoEspera: "En espera",
    estadoAcepto: "Aceptó",
    estadoNoAcepto: "No aceptó",
    // Se dio de baja desde su correo (rechazado con fecha de salida).
    estadoSalio: "Ya no es contacto",
    primeroTitulo: "Agrega tu primer contacto",
    segundoTitulo: "Agrega un segundo contacto",
    // {nombre} es el único contacto de la lista.
    segundoTexto: "Si {nombre} no responde, avisaremos a otra persona de confianza.",
    // Un solo contacto y ya aceptó: advertencia con todo el texto desplegado (decisión de Mariola, 14/11).
    soloUnoTexto: "Hoy tu aviso depende solo de {nombre}. Si no ve el correo a tiempo, nadie más se entera. Con dos contactos, avisamos al siguiente. Puedes tener hasta 5.",
    otraPersonaTitulo:"Invita a otra persona",
    otraPersonaTexto: "{nombre} no aceptó. Necesitas al menos un contacto que acepte para encender tu aviso.",
    continuar: "Continuar",
    reenviar: "Reenviar invitación",
    reenviando: "Reenviando…",
    reenviada: "Invitación reenviada",
    // El diseño no cubre que el correo falle. Nunca se dice "enviada" si no salió.
    falloCorreo: "Guardamos el contacto, pero no pudimos enviarle la invitación por correo. Pulsa \"Enviar invitación\" para intentarlo de nuevo.",
    // Al reenviar. "Guardamos el contacto…" solo vale al crear uno nuevo.
    falloReenvio: "No pudimos reenviar la invitación. Inténtalo de nuevo.",
    yaRespondio: "Esta persona ya respondió a la invitación. Actualizamos la lista.",
    noEnviada: "Invitación sin enviar",
    enviarAhora: "Enviar invitación",
    quitar: "Quitar",
    quitarPregunta: "¿Quitar a {nombre} de tus contactos?",
    // Una frase por estado: lo que se pierde al quitar no es lo mismo en cada caso.
    quitarAceptado: "Ya no le avisaremos si no confirmas a tiempo.",
    quitarPendiente: "La invitación que le enviaste dejará de valer.",
    quitarSinEnviar: "Su invitación no llegó a enviarse.",
    quitarRechazado: "Saldrá de tu lista y dejará su sitio libre.",
    quitarSi: "Sí, quitar",
    quitarNo: "Cancelar",
    quitando: "Quitando…",
    quitado: "Contacto quitado",
    falloQuitar: "No pudimos quitar el contacto. Inténtalo de nuevo.",
    vacio: "Todavía no agregaste contactos.",
  },
  correo: {
    asunto: (quien: string) => `${quien} te invitó a ser su contacto de confianza`,
    // PROVISIONAL: el texto definitivo de la invitación es del flujo de quien recibe (R1).
    // mensaje: texto personalizado de quien invita (ya escapado). Vacío = invitación general.
    cuerpo: (contacto: string, quien: string, app: string, enlace: string, mensaje = "") =>
      `<p>Hola, ${contacto}:</p>` +
      (mensaje ? `<p>${quien} te escribe: "${mensaje}"</p>` : "") +
      `<p>${quien} te invita a ser su contacto de confianza en ${app}. Si un día no confirma a tiempo que está bien, te avisaremos para que puedas comunicarte con esa persona.</p>` +
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
