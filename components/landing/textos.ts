// Textos de la landing (AGENTS.md sección 5: los textos viven en un archivo, no dentro de los componentes).
// Todos son propuestas para validar con el equipo. No se usa "marca blanca" en ningún texto visible.
// Tono: informa y acompaña. Sin "emergencia", "peligro" ni "muerte".

export const textosLanding = {
  saltarAlContenido: "Saltar al contenido",
  navegacion: {
    etiqueta: "Principal",
    soyContacto: "Soy contacto",
    organizaciones: "Soy una organización",
    instalar: "Instalar",
    abrirMenu: "Menú",
    cerrarMenu: "Cerrar",
    irAlInicio: (nombre: string) => `${nombre}, ir al inicio`,
  },
  hero: {
    // Opción A elegida por el equipo (se ajusta mejor a todos los segmentos).
    titulo: "Tu tranquilidad y la de los tuyos, en un toque.",
    subtitulo: "Un toque para decir que estás bien.",
    instalar: "Instalar",
    meInvitaron: "Me invitaron a ser contacto",
    video: { pausar: "Pausar video", reproducir: "Reproducir video" },
  },
  comoFunciona: {
    titulo: "Cómo funciona",
    pasos: [
      { titulo: "Eliges tu hora y tus contactos", detalle: "Tú decides cuándo confirmar y a quién avisar." },
      { titulo: "Confirmas con un toque", detalle: "Un toque al día y listo." },
      {
        titulo: "Si no confirmas a tiempo, avisamos a tus contactos",
        detalle: "Antes de avisar, te damos un tiempo de gracia.",
        // Fragmento del detalle que se resalta en negrita.
        destacado: "tiempo de gracia",
      },
    ],
  },
  privacidad: {
    titulo: "Tu privacidad está a salvo",
    // POR AJUSTAR: el PRD está desactualizado (ya se pidió actualizarlo). Estas afirmaciones las dio el equipo
    // de diseño; validarlas con desarrollo antes de publicar.
    afirmaciones: [
      "Nada se comparte por defecto.",
      "La organización no ve los datos de las personas.",
      "No guardamos datos de salud.",
      "La ubicación solo se usa de forma puntual.",
    ],
    // PENDIENTE: la política de privacidad aún no existe; cuando exista, enlazarla aquí.
    politica: "Política de privacidad",
    politicaPendiente: "Disponible pronto",
  },
  instalar: {
    titulo: "Instala la app",
    cuerpo: "Se instala desde el navegador, sin pasar por una tienda.",
    boton: "Instalar ahora",
    yaInstalada: "La app ya está instalada en este dispositivo.",
    pestanas: { etiqueta: "Tu dispositivo", iphone: "iPhone", android: "Android" },
    iphone: [
      "Abre esta página en Safari.",
      "Toca el botón Compartir.",
      "Elige “Agregar a inicio”.",
    ],
    // Pasos dados por el equipo. Confirmar el texto exacto de las opciones del menú.
    android: [
      "Abre esta página en tu navegador.",
      "Toca los tres puntos de la esquina superior derecha.",
      "Elige la opción “Instalar” y “Crear acceso directo”.",
    ],
  },
  contacto: {
    titulo: "¿Te invitaron a ser contacto?",
    // POR REVISAR: la redacción sobre voluntariedad y responsabilidad la debe revisar alguien del equipo.
    // No es un contrato ni una obligación.
    puntos: [
      "Es voluntario.",
      "No instalas nada.",
      "Si quien te invitó no confirma que está bien, te avisamos.",
      "Puedes dejar de serlo cuando quieras.",
    ],
    dejar: "Dejar de ser contacto",
  },
  organizaciones: {
    titulo: "Con la personalidad de tu marca",
    cuerpo: "La app puede llevar el nombre, el logo y los colores de tu organización.",
    boton: "Conocer más",
  },
  noHace: {
    titulo: "Lo que esta app no hace",
    puntos: [
      { titulo: "No es ayuda inmediata", descripcion: "No reemplaza a los servicios de ayuda." },
      { titulo: "No es un localizador", descripcion: "No sigue dónde estás." },
      { titulo: "No te vigila", descripcion: "Solo sabe si confirmaste o no." },
    ],
  },
  baja: {
    titulo: "¿Quieres dejar de ser contacto?",
    cuerpo: "Escribe tu correo y te enviamos un enlace.",
    accion: "Dejar de ser contacto",
  },
  pie: {
    etiqueta: "Pie de página",
    privacidad: "Privacidad",
    organizaciones: "Para organizaciones",
  },
  paginaOrganizaciones: {
    titulo: "Para organizaciones",
    entrada: "Con la personalidad de tu marca",
    cuerpo: "Ofrece a tus personas una forma simple de avisar que están bien, con el aspecto de tu organización.",
    personalizas: {
      titulo: "Lo que puedes personalizar",
      puntos: ["El nombre de la app", "El logo y los colores", "Los textos y los valores por defecto"],
    },
    mismaApp: {
      titulo: "Los pasos son los mismos",
      cuerpo: "Quien usa la app y sus contactos siguen el mismo recorrido, sin importar la marca.",
    },
    volver: "Volver al inicio",
  },
};

export type TextosLanding = typeof textosLanding;
