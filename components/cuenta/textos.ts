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
  // Borrar cuenta (E8)
  borrarTitulo: "Borrar mi cuenta",
  borrarTexto:
    "Se borrarán tu cuenta y todos tus datos: tu aviso, tus contactos y tu historial. Tus contactos recibirán un aviso y no recibirán más alertas tuyas. No se puede deshacer.",
  boton: "Borrar mi cuenta",
  ayudaMantener: "Mantén presionado el botón durante 2 segundos.",
  confirmarPregunta: "¿Confirmas que quieres borrar tu cuenta? No se puede deshacer.",
  confirmarSi: "Sí, borrar mi cuenta",
  volver: "Volver",
  enviando: "Borrando tu cuenta…",
  errorGenerico: "No pudimos borrar tu cuenta. Revisa tu conexión e inténtalo de nuevo.",
  // Con una alerta en curso no se borra: primero se cancela.
  alertaEnCurso: "Tienes una alerta en curso. Cancélala desde Inicio antes de borrar tu cuenta.",
  irInicio: "Ir a Inicio",
  // Pantalla final
  borradaTitulo: "Tu cuenta se borró",
  borradaTexto: "Eliminamos tu cuenta y tus datos. Avisamos a tus contactos para que no esperen más alertas tuyas.",
  borradaIr: "Ir al inicio de sesión",
  // Correo a los contactos que ya habían aceptado (R7: informa, sin dramatizar)
  correoAsunto: "{app}: {nombre} borró su cuenta",
  correoCuerpo1: "{nombre} borró su cuenta en {app}.",
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
