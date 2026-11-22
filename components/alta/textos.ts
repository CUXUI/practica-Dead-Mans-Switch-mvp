import type { Variant } from "@/lib/brand";

// Textos del flujo 1 · Alta de quien emite (E0). Viven aquí y hay un bloque por versión
// (AGENTS.md sección 5). Hoy las dos versiones dicen lo mismo; cuando cambie una, se edita
// solo su bloque. Tuteo neutro. Textos tomados de los wireframes "Flujo de alta e ingreso (Web App)".

const COMUNES = {
  registro: {
    titulo: "Crea tu cuenta",
    volver: "Volver",
    nombre: "Nombre",
    nombreEjemplo: "Ej.: Mariana López",
    correo: "Correo",
    correoEjemplo: "Ej.: mariana@correo.com",
    celular: "Celular",
    celularEjemplo: "Ej.: 300 123 4567",
    contrasena: "Contraseña",
    contrasenaEjemplo: "Crea una contraseña",
    contrasenaAyuda: "Mínimo 8 caracteres",
    mostrarContrasena: "Mostrar contraseña",
    ocultarContrasena: "Ocultar contraseña",
    mayorDeEdad: "Confirmo que tengo 18 años o más.",
    noReemplazaEmergencias: "Entiendo que esta app no reemplaza a los servicios de emergencia.",
    revisaCampo: "Revisa este campo",
    revisaOpcion: "Revisa esta opción",
    correoRegistradoTitulo: "Ya tienes una cuenta con este correo",
    correoRegistradoCuerpo: "Inicia sesión o usa otro correo para crear una cuenta nueva.",
    correoRegistradoCampo: "Ya hay una cuenta con este correo",
    iniciarSesion: "Iniciar sesión",
    sinConexionTitulo: "Sin conexión",
    sinConexionCuerpo: "Conéctate a internet para crear una cuenta.",
    reintentar: "Reintentar",
    errorGeneralTitulo: "No pudimos crear tu cuenta",
    errorGeneralCuerpo: "Inténtalo de nuevo en unos minutos.",
    boton: "Crea una cuenta",
    cargando: "Cargando",
    confirmaTuCorreo:
      "Te enviamos un correo para confirmar tu cuenta. Revisa también la carpeta de spam.",
    yaTienesCuenta: "¿Ya tienes cuenta?",
  },
  // Guía de instalación: no tiene wireframe; textos aprobados por Sarah (15 nov 2026).
  instalar: {
    titulo: "Agrega la app a tu pantalla de inicio",
    cuerpo: "Accede con un solo toque y recibe recordatorios para confirmar que estás bien.",
    iosPasos: [
      { titulo: "Toca el botón Compartir", detalle: "Es el cuadro con una flecha hacia arriba en la barra de Safari." },
      { titulo: "Elige «Agregar a inicio»", detalle: "Si no lo ves, desliza el menú hacia arriba." },
      { titulo: "Toca «Agregar»", detalle: "Está arriba a la derecha." },
      { titulo: "Ábrela desde tu pantalla de inicio", detalle: "Inicia sesión de nuevo para continuar." },
    ],
    iosOtroNavegador: "Si usas otro navegador, busca «Agregar a inicio» en su menú Compartir.",
    androidBoton: "Instalar app",
    androidPasos: [
      { titulo: "Abre el menú del navegador", detalle: "Son los tres puntos arriba a la derecha." },
      { titulo: "Elige «Instalar app»", detalle: "En algunos teléfonos dice «Agregar a la pantalla principal»." },
      { titulo: "Ábrela desde tu pantalla de inicio", detalle: "Inicia sesión de nuevo para continuar." },
    ],
    instaladaTitulo: "La app está lista",
    instaladaCuerpo: "Ábrela desde tu pantalla de inicio para continuar.",
    escritorioCuerpo: "Abre esta página en tu celular para instalarla.",
    continuar: "Continuar en el navegador",
  },
  // R1-E1 · Inicio de la web app (wireframe).
  inicio: {
    titulo: "Confirma que estás bien. Si no puedes, avisamos a tus contactos.",
    cuerpo:
      "Cada día entras a la app para confirmar. Si no lo haces a tiempo, tus contactos reciben una alerta por correo.",
    pregunta: "¿Ya tienes una cuenta?",
    siIniciarSesion: "Sí, iniciar sesión",
    noCrearCuenta: "No, crear cuenta",
  },
  // Onboarding · comienzo (wireframe).
  listo: {
    titulo: "Tu cuenta está lista. Falta poco.",
    cuerpo: "Vamos a dejar tu aviso listo en 3 pasos. Toma menos de 5 minutos.",
    pasos: [
      { titulo: "Activa las notificaciones", detalle: "Así te recordamos confirmar a tiempo." },
      { titulo: "Elige a tus contactos", detalle: "Quienes recibirán la alerta por correo." },
      { titulo: "Configura tu primer aviso", detalle: "Hora, tiempo de gracia y mensaje." },
    ],
    empezar: "Empezar",
  },
  // Onboarding · notificaciones (wireframes). Textos nuevos aprobados por Sarah (15 nov 2026). La pantalla "desactivadas" sigue el PRD:
  // sin notificaciones, los recordatorios llegan por correo. Una web no puede abrir los
  // ajustes del teléfono, por eso se dan instrucciones en lugar de ese botón.
  notificaciones: {
    paso: "Paso 1 de 3",
    siguiente: "Siguiente: Contactos",
    pedirTitulo: "Activa las notificaciones",
    pedirCuerpo: "Así te recordamos confirmar a tiempo y te enteras si hay una alerta.",
    activar: "Activar notificaciones",
    activando: "Activando",
    ahoraNo: "Ahora no",
    activasEtiqueta: "Activas",
    activasTitulo: "Notificaciones activas",
    activasCuerpo: "Te avisaremos cuando sea hora de confirmar que estás bien.",
    desactivadasTitulo: "Las notificaciones están desactivadas",
    desactivadasCuerpo:
      "Sin ellas, te recordaremos confirmar solo por correo. El correo puede tardar más o llegar a spam.",
    comoActivarTitulo: "Cómo activarlas",
    comoActivarAndroid:
      "Toca el ícono de información del sitio, a la izquierda de la dirección, entra a Permisos y activa Notificaciones.",
    comoActivarIOS: "Abre Ajustes del iPhone, entra a Notificaciones, busca la app y activa Permitir notificaciones.",
    comoActivarEscritorio:
      "Haz clic en el ícono de información del sitio, a la izquierda de la dirección, y permite las notificaciones.",
    iosSinInstalarTitulo: "En iPhone, primero agrega la app a inicio",
    iosSinInstalarCuerpo:
      "Las notificaciones solo funcionan desde la app instalada en tu pantalla de inicio; mientras tanto, te recordaremos por correo.",
    verGuia: "Ver cómo agregarla",
    yaLasPermitiste: "¿Ya las permitiste?",
    revisarDeNuevo: "Revisar de nuevo",
    errorActivar: "No pudimos activar las notificaciones. Inténtalo de nuevo.",
    nota: "Podrás activarlas después desde los ajustes de tu dispositivo. Tu aviso empieza apagado hasta que lo configures.",
    continuar: "Continuar",
    continuarSin: "Continuar sin notificaciones",
  },
};

export type TextosAlta = typeof COMUNES;

const POR_VERSION: Record<Variant, TextosAlta> = {
  cerca: { ...COMUNES },
  montana: { ...COMUNES },
};

export function textosAlta(variant: Variant): TextosAlta {
  return POR_VERSION[variant];
}
