// Configuración de la landing. Vive aparte de lib/brand.ts: la landing no depende del núcleo de la app.
// Aquí cambian el nombre, el eslogan y la descripción, y se activa o desactiva "Para organizaciones".
// Logo, eslogan y descripción son placeholders (brief de la landing).

export type ConfigLanding = {
  nombre: string;
  eslogan: string;
  descripcion: string;
  // Si es false, se ocultan la entrada del menú, la sección del home, el enlace del pie y la página.
  mostrarOrganizaciones: boolean;
};

export const configLanding: ConfigLanding = {
  nombre: "Nombre de la App",
  eslogan: "Tu tranquilidad y la de los tuyos, en un toque.",
  descripcion: "Un toque para decir que estás bien. Si no lo das, tus contactos lo sabrán.",
  mostrarOrganizaciones: true,
};

export const RUTA_LANDING = "/landing";
// Pantalla de la app donde el contacto escribe su correo para recibir el enlace de baja.
export const RUTA_BAJA_CONTACTO = "/baja/solicitar";
