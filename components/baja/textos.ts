export const textosBaja = {
  confirmar: {
    titulo: (nombre: string) => `¿Dejar de ser contacto de ${nombre}?`,
    cuerpo: "No recibirás más alertas suyas. Le avisaremos para que pueda elegir a otra persona.",
    accion: "Dejar de ser contacto",
    cancelar: "Cancelar",
    enviando: "Enviando código…",
  },
  cancelado: {
    titulo: (nombre: string) => `No realizamos cambios. Sigues siendo contacto de ${nombre}`,
    cuerpo: "Continuarás recibiendo sus alertas como hasta ahora.",
    accion: "Entendido",
  },
  codigo: {
    titulo: "Escribe el código que te enviamos por correo",
    etiqueta: "Código de confirmación",
    enviado: (correo: string) => `Te lo enviamos a ${correo}.`,
    reenviar: "Reenviar código",
    reenviando: "Reenviando…",
    confirmar: "Confirmar",
    comprobando: "Comprobando…",
    incorrecto: "El código no es correcto. Prueba otra vez.",
    vencido: "El código venció o alcanzó el límite de intentos. Solicita uno nuevo.",
  },
  alerta: {
    etiqueta: "ALERTA EN CURSO",
    titulo: (nombre: string) => `${nombre} no ha confirmado que está bien`,
    cuerpo: "Si te das de baja, avisaremos a quien emite para que pueda buscar otro contacto.",
    accion: "Darme de baja igual",
    volver: "Volver",
  },
  listo: {
    titulo: (nombre: string) => `Ya no eres contacto de ${nombre}`,
    cuerpo: "Si cambias de opinión, pídele que te invite de nuevo.",
  },
  inactivo: {
    titulo: "Este enlace ya no está activo",
    cuerpo: "Puede que ya hayas completado la baja o que la relación de contacto haya cambiado.",
  },
  error: "No pudimos completar la solicitud. Revisa tu conexión e inténtalo otra vez.",
};
