// Textos de la baja del contacto. Sin código: se pide el correo, llega un enlace y se confirma en pantalla.
export const textosBaja = {
  inicio: {
    titulo: "¿Quieres dejar de ser contacto de alguien?",
    cuerpo: "Escribe tu correo y te enviamos un enlace.",
    campo: "Tu correo",
    placeholder: "tu correo",
    boton: "Enviarme el enlace",
    enviando: "Enviando…",
    correoInvalido: "Escribe un correo válido.",
    errorEnvio: "No pudimos enviar el enlace. Revisa tu conexión e inténtalo otra vez.",
  },
  enviado: {
    titulo: "Revisa tu correo",
    cuerpo: (correo: string) => `Si ${correo} es de un contacto, te enviamos un enlace para dejar de serlo. Vale 24 horas.`,
    ayuda: "Si no llega, revisa la carpeta de spam.",
    otroCorreo: "Usar otro correo",
  },
  confirmar: {
    titulo: (nombre: string) => `¿Dejar de ser contacto de ${nombre}?`,
    cuerpo: "No recibirás más alertas suyas. Le avisaremos para que pueda elegir a otra persona.",
    alerta: (nombre: string) =>
      `Ahora mismo hay una alerta en curso: ${nombre} no ha confirmado que está bien. Si te das de baja, le avisaremos para que busque otro contacto.`,
    accion: "Dejar de ser contacto",
    ayudaMantener: "Mantén presionado 2 segundos.",
    ayudaSuelta: "Si lo sueltas antes, no se hace ningún cambio.",
    sigue: "Sigue presionando…",
    ayudaAsistida: "Con teclado o lector de pantalla: pulsa el botón y confirma.",
    confirmarPregunta: (nombre: string) => `¿Dejar de ser contacto de ${nombre}?`,
    confirmarSi: "Sí, dejar de ser contacto",
    volver: "Volver",
    enviando: "Enviando…",
    cancelar: "Cancelar",
  },
  cancelado: {
    titulo: (nombre: string) => `No realizamos cambios. Sigues siendo contacto de ${nombre}`,
    cuerpo: "Continuarás recibiendo sus alertas como hasta ahora.",
    accion: "Entendido",
  },
  listo: {
    titulo: (nombre: string) => `Ya no eres contacto de ${nombre}`,
    cuerpo: "Si cambias de opinión, pídele que te invite de nuevo.",
  },
  inactivo: {
    titulo: "Este enlace ya no está activo",
    cuerpo: "Puede que haya vencido, que ya hayas completado la baja o que la relación de contacto haya cambiado.",
    pedirNuevo: "Pedir un enlace nuevo",
  },
  error: "No pudimos completar la solicitud. Revisa tu conexión e inténtalo otra vez.",
};
