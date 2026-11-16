import type { Variant } from "@/lib/brand";

// Textos de Cuenta (E8). Un bloque por versión (AGENTS.md sección 5).
// Marcadores: {nombre}, {app}. Tuteo neutro; sin "emergencia", "peligro" ni "muerte".

const COMUNES = {
  titulo: "Tu cuenta",
  datos: "Tus datos",
  nombre: "Nombre",
  telefono: "Teléfono",
  correo: "Correo",
  sinDato: "Sin completar",
  cerrarSesion: "Cerrar sesión",
  // Eliminar la cuenta (E8). Textos del Diálogo de confirmación · Destructiva de la Biblioteca.
  borrarTitulo: "Eliminar mi cuenta",
  borrarTexto: "Si eliminas tu cuenta, dejamos de avisar a tus contactos y se borran tus datos.",
  abrirDialogo: "Eliminar mi cuenta",
  dialogoTitulo: "¿Quieres eliminar tu cuenta?",
  dialogoTexto:
    "Se borran tu aviso, tus contactos y tu historial. Tus contactos dejarán de recibir alertas. Esta acción no se puede deshacer.",
  boton: "Eliminar mi cuenta",
  ayudaMantener: "Mantén presionado el botón durante 2 segundos.",
  cancelar: "Cancelar",
  enviando: "Eliminando tu cuenta…",
  errorGenerico: "No pudimos eliminar tu cuenta. Revisa tu conexión e inténtalo de nuevo.",
  // Con una alerta en curso no se elimina: primero se cancela.
  alertaEnCurso: "Tienes una alerta en curso. Cancélala desde Inicio antes de eliminar tu cuenta.",
  irInicio: "Ir a Inicio",
  // Pantalla final
  borradaTitulo: "Tu cuenta se eliminó",
  borradaTexto: "Borramos tu cuenta y tus datos. Avisamos a tus contactos para que no esperen más alertas tuyas.",
  borradaIr: "Ir al inicio de sesión",
  // Correo a los contactos que ya habían aceptado (R7: informa, sin dramatizar)
  correoAsunto: "{app}: {nombre} eliminó su cuenta",
  correoCuerpo1: "{nombre} eliminó su cuenta en {app}.",
  correoCuerpo2: "Ya no eres su contacto de confianza y no recibirás más alertas suyas. No tienes que hacer nada.",
};

export type TextosCuenta = typeof COMUNES;

const POR_VERSION: Record<Variant, TextosCuenta> = {
  cerca: { ...COMUNES },
  montana: { ...COMUNES },
};

export function textosCuenta(variant: Variant): TextosCuenta {
  return POR_VERSION[variant];
}
