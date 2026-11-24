// Mapa Figma ↔ código. Una fila por componente de la Biblioteca de Figma.
// estado: "sistema" = construido en components/ds y reutilizable · "producto" = construido dentro de un flujo,
// con los tokens del sistema · "figma" = diseñado, todavía sin construir · "maqueta" = solo sirve para prototipos.
export type Estado = "sistema" | "producto" | "figma" | "maqueta";
export type Fila = { seccion: string; nombre: string; figma: string; estado: Estado; codigo?: string };

export const COBERTURA: Fila[] = [
  { seccion: "01 · Fundamentos", nombre: "Variables de color, número y tipografía", figma: "2018:57", estado: "sistema", codigo: "tokens/tokens.json → app/tokens.css" },
  { seccion: "01 · Fundamentos", nombre: "Íconos (43)", figma: "3879:27386", estado: "sistema", codigo: "components/ds/Icono.tsx" },
  { seccion: "01 · Fundamentos", nombre: "Marca de la app y logos", figma: "3723:26375", estado: "sistema", codigo: "components/ds/Navegacion.tsx · MarcaApp" },

  { seccion: "02 · Acciones", nombre: "Action Button", figma: "2200:1060", estado: "sistema", codigo: "components/ds/Boton.tsx · Boton" },
  { seccion: "02 · Acciones", nombre: "Botón ícono", figma: "3714:6064", estado: "sistema", codigo: "components/ds/Boton.tsx · BotonIcono" },
  { seccion: "02 · Acciones", nombre: "Enlace y Enlace con ícono", figma: "3724:27503", estado: "sistema", codigo: "components/ds/Boton.tsx · Enlace" },
  { seccion: "02 · Acciones", nombre: "Botón de añadir", figma: "4118:35375", estado: "sistema", codigo: "components/ds/Boton.tsx · BotonAnadir" },
  { seccion: "02 · Acciones", nombre: "Zona de acción fija y de flujo", figma: "4094:25079", estado: "sistema", codigo: "components/ds/Navegacion.tsx · ZonaAccion" },
  { seccion: "02 · Acciones", nombre: "Botón para mantener presionado", figma: "4002:31792", estado: "producto", codigo: "components/home/HoldButton.tsx" },
  { seccion: "02 · Acciones", nombre: "Botón «Estoy bien»", figma: "3724:26892", estado: "producto", codigo: "components/home/ControlAviso.tsx" },

  { seccion: "03 · Formularios y controles", nombre: "Campo/Input", figma: "2293:1356", estado: "sistema", codigo: "components/ds/Campo.tsx" },
  { seccion: "03 · Formularios y controles", nombre: "Radio Button", figma: "2293:1422", estado: "sistema", codigo: "components/ds/Seleccion.tsx · Radio" },
  { seccion: "03 · Formularios y controles", nombre: "Opción/Checkbox", figma: "2172:1081", estado: "sistema", codigo: "components/ds/Seleccion.tsx · Casilla" },
  { seccion: "03 · Formularios y controles", nombre: "Control/Interruptor", figma: "2279:1427", estado: "sistema", codigo: "components/ds/Seleccion.tsx · Interruptor" },
  { seccion: "03 · Formularios y controles", nombre: "Control segmento (repetición, margen, mensaje)", figma: "2942:12332", estado: "sistema", codigo: "components/ds/Seleccion.tsx · ControlSegmentado" },
  { seccion: "03 · Formularios y controles", nombre: "Selector de días", figma: "2942:12272", estado: "producto", codigo: "components/contactos/Dia.tsx" },
  { seccion: "03 · Formularios y controles", nombre: "Campo de hora y Selector de hora", figma: "4141:37508", estado: "producto", codigo: "components/aviso/SelectorHora.tsx" },
  { seccion: "03 · Formularios y controles", nombre: "Lista de pasos", figma: "4148:39235", estado: "producto", codigo: "components/aviso/ConfigurarAviso.tsx" },
  { seccion: "03 · Formularios y controles", nombre: "Contactos del aviso", figma: "4148:39747", estado: "producto", codigo: "components/aviso/ConfigurarAviso.tsx" },
  { seccion: "03 · Formularios y controles", nombre: "Campo de código (6 dígitos)", figma: "3714:6592", estado: "figma" },
  { seccion: "03 · Formularios y controles", nombre: "Slider", figma: "2249:1245", estado: "figma" },

  { seccion: "04 · Navegación", nombre: "Barra de navegación y Destino", figma: "3869:28320", estado: "sistema", codigo: "components/ds/Navegacion.tsx · BarraNavegacion" },
  { seccion: "04 · Navegación", nombre: "Encabezado", figma: "3937:20660", estado: "sistema", codigo: "components/ds/Navegacion.tsx · Encabezado" },
  { seccion: "04 · Navegación", nombre: "Barra de título", figma: "4708:65613", estado: "sistema", codigo: "components/ds/Navegacion.tsx · BarraTitulo" },
  { seccion: "04 · Navegación", nombre: "Stepper", figma: "3963:30555", estado: "sistema", codigo: "components/ds/Navegacion.tsx · Stepper" },
  { seccion: "04 · Navegación", nombre: "Fila de navegación", figma: "2737:6668", estado: "sistema", codigo: "components/ds/Navegacion.tsx · FilaNavegacion" },
  { seccion: "04 · Navegación", nombre: "Título de grupo", figma: "5039:73202", estado: "sistema", codigo: "components/ds/Navegacion.tsx · TituloGrupo" },
  { seccion: "04 · Navegación", nombre: "Tabs", figma: "2249:1390", estado: "figma" },
  { seccion: "04 · Navegación", nombre: "Mensaje de resultado", figma: "5039:73356", estado: "figma" },

  { seccion: "05 · Tarjetas y contenido", nombre: "Card", figma: "2675:5520", estado: "sistema", codigo: "components/ds/Contenido.tsx · Card" },
  { seccion: "05 · Tarjetas y contenido", nombre: "Badge", figma: "2675:5424", estado: "sistema", codigo: "components/ds/Contenido.tsx · Badge" },
  { seccion: "05 · Tarjetas y contenido", nombre: "Fila de info y Fila de dato", figma: "2675:5428", estado: "sistema", codigo: "components/ds/Contenido.tsx" },
  { seccion: "05 · Tarjetas y contenido", nombre: "Contacto", figma: "2675:5436", estado: "sistema", codigo: "components/ds/Contenido.tsx · Contacto" },
  { seccion: "05 · Tarjetas y contenido", nombre: "Paso", figma: "2765:9676", estado: "sistema", codigo: "components/ds/Contenido.tsx · Paso" },
  { seccion: "05 · Tarjetas y contenido", nombre: "Estado vacío", figma: "3724:27226", estado: "sistema", codigo: "components/ds/Contenido.tsx · EstadoVacio" },
  { seccion: "05 · Tarjetas y contenido", nombre: "Desplegable", figma: "3823:17052", estado: "sistema", codigo: "components/ds/Contenido.tsx · Desplegable" },
  { seccion: "05 · Tarjetas y contenido", nombre: "Estado de invitación", figma: "3729:27681", estado: "producto", codigo: "components/contactos/ListaContactos.tsx" },
  { seccion: "05 · Tarjetas y contenido", nombre: "Fila de perfil", figma: "3714:6613", estado: "producto", codigo: "app/cuenta/page.tsx" },
  { seccion: "05 · Tarjetas y contenido", nombre: "Rol del contacto", figma: "3729:27712", estado: "figma" },

  { seccion: "06 · Mensajes del sistema", nombre: "Banner de sistema", figma: "3693:26723", estado: "sistema", codigo: "components/ds/Mensajes.tsx · Banner" },
  { seccion: "06 · Mensajes del sistema", nombre: "Toast", figma: "3713:2996", estado: "sistema", codigo: "components/ds/Mensajes.tsx · ToastVisual" },
  { seccion: "06 · Mensajes del sistema", nombre: "Diálogo de confirmación y Fondo atenuado", figma: "3714:4805", estado: "sistema", codigo: "components/ds/Mensajes.tsx · Dialogo" },
  { seccion: "06 · Mensajes del sistema", nombre: "Indicador/Cargando", figma: "3956:29967", estado: "sistema", codigo: "components/ds/Mensajes.tsx · Cargando" },
  { seccion: "06 · Mensajes del sistema", nombre: "Permiso de notificaciones", figma: "3714:4764", estado: "producto", codigo: "components/alta/PasoNotificaciones.tsx" },

  { seccion: "07 · Aviso y alerta · quien emite", nombre: "Tarjeta de aviso", figma: "3723:26622", estado: "producto", codigo: "components/home/InicioActivo.tsx e InicioApagado.tsx" },
  { seccion: "07 · Aviso y alerta · quien emite", nombre: "Tarjeta de alerta", figma: "3724:26812", estado: "producto", codigo: "components/home/InicioAlerta.tsx" },
  { seccion: "07 · Aviso y alerta · quien emite", nombre: "Fila de historial", figma: "3724:27066", estado: "producto", codigo: "components/historial/FilaHistorial.tsx" },
  { seccion: "07 · Aviso y alerta · quien emite", nombre: "Paso de seguimiento (línea de tiempo)", figma: "3722:12834", estado: "figma" },
  { seccion: "07 · Aviso y alerta · quien emite", nombre: "Notificación push", figma: "3724:27246", estado: "maqueta" },

  { seccion: "08 · Quien cuida", nombre: "Tarjeta de alerta recibida e Instrucciones", figma: "3724:27174", estado: "producto", codigo: "components/alerta/AlertaPantalla.tsx" },
  { seccion: "08 · Quien cuida", nombre: "Tarjeta de invitación", figma: "3729:27993", estado: "producto", codigo: "components/invitacion/AceptarContacto.tsx" },
  { seccion: "08 · Quien cuida", nombre: "Acceso por enlace", figma: "3729:28013", estado: "producto", codigo: "app/alerta/[token]/page.tsx" },
  { seccion: "08 · Quien cuida", nombre: "Vista previa de alerta", figma: "3724:27181", estado: "figma" },

  { seccion: "09 · Correos", nombre: "Correo y Pie de correo", figma: "3729:28425", estado: "producto", codigo: "lib/email.ts y lib/motor.ts" },
];

export const PENDIENTES: { titulo: string; detalle: string; quien: "Diseño" | "Código" | "Equipo" }[] = [
  { quien: "Diseño", titulo: "El título de pantalla tiene dos medidas", detalle: "La variable tamano/pantalla dice 32/40 y el estilo de texto Título/Pantalla dice 28/36. El código usa 28/36, que es lo que está aplicado en las pantallas. Falta dejar una sola." },
  { quien: "Diseño", titulo: "Faltan dos colores de texto para estados", detalle: "Los formularios usan un rojo para el texto de error (#b3261e) y un verde para la confirmación (#1b6e3c) que no existen como variables en Figma. En el código ya son tokens: estado/error/texto y estado/exito/texto." },
  { quien: "Diseño", titulo: "Cuatro medidas sin variable", detalle: "La descripción del Radio Button las nombra: foco/anillo-distancia, foco/anillo-grosor, borde/grosor-s y borde/grosor-m. En el código el foco es de 3 px separado 2 px." },
  { quien: "Diseño", titulo: "Los modos de Número y Tipografía no cambian nada", detalle: "Las colecciones Número y Tipografía tienen tres modos con los mismos valores. Si ninguna marca va a cambiarlos, alcanza con un modo." },
  { quien: "Diseño", titulo: "Componentes duplicados y sección «Por eliminar»", detalle: "Hay dos Badge y dos Estado de invitación fuera de la Biblioteca, tres versiones del botón de mantener y la sección 99. Conviene dejar una sola de cada una antes de publicar la librería." },
  { quien: "Equipo", titulo: "Publicar los tokens en Supernova", detalle: "El export de Supernova del 14/11 solo traía el modo Cerca. tokens/tokens.json ya tiene los tres modos con los mismos nombres: cuando Supernova esté completo, reemplaza ese paso sin tocar componentes." },
  { quien: "Código", titulo: "Siete componentes diseñados sin construir", detalle: "Campo de código, Slider, Tabs, Mensaje de resultado, Rol del contacto, Paso de seguimiento y Vista previa de alerta. Ninguno bloquea el MVP." },
  { quien: "Código", titulo: "Mover al sistema lo que nació en un flujo", detalle: "Selector de hora, Lista de pasos, Estado de invitación y Fila de historial funcionan y usan los tokens, pero viven en la carpeta de su flujo. Cuando otro flujo los necesite, pasan a components/ds." },
];
