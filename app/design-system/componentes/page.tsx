import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Chip, Codigo, EnlaceExterno, Lienzo, TituloPagina, enFigma } from "../_ui/piezas";
import { DemoBadges, DemoBoton, DemoBotonesMenores, DemoCampo, DemoCards, DemoContenido, DemoMantener, DemoMensajes, DemoNavegacion, DemoSeleccion } from "../_ui/Demos";
import { FOCO } from "@/components/ds/estilos";

export const metadata: Metadata = { title: "Componentes" };

type Ficha = {
  id: string;
  nombre: string;
  // Sección de la Biblioteca de Figma a la que pertenece.
  seccion: string;
  figma: string;
  archivo: string;
  resumen: string;
  uso: string[];
  accesibilidad: string[];
  codigo: string;
  demo: ReactNode;
};

const FICHAS: Ficha[] = [
  {
    id: "action-button",
    nombre: "Action Button",
    seccion: "02 · Acciones",
    figma: "2200:1060",
    archivo: "components/ds/Boton.tsx",
    resumen: "El botón del sistema. Principal para la acción más importante de la pantalla y Secundario para las demás.",
    uso: [
      "Una sola acción principal por pantalla. Si hay dos, la segunda es secundaria.",
      "El texto dice lo que va a pasar: «Guardar aviso», no «Aceptar».",
      "Mientras espera al servidor pasa a Cargando: no se puede volver a tocar y el texto cambia.",
      "Deshabilitado siempre va con una explicación cerca de por qué no se puede usar.",
    ],
    accesibilidad: ["Alto mínimo de 48 px (WCAG 2.5.8).", "Texto blanco sobre el color de marca: mínimo 4,5:1 en los tres temas.", "Cargando avisa con aria-busy; el foco no se pierde.", "Foco visible: anillo de 3 px separado 2 px."],
    codigo: `import { Boton } from "@/components/ds/Boton";

<Boton>Guardar aviso</Boton>
<Boton tipo="secundario" icono="rotate-cw">Reintentar ahora</Boton>
<Boton cargando textoCargando="Enviando…">Enviar invitación</Boton>`,
    demo: <DemoBoton />,
  },
  {
    id: "acciones-menores",
    nombre: "Botón ícono, Enlace y Botón de añadir",
    seccion: "02 · Acciones",
    figma: "3714:6064",
    archivo: "components/ds/Boton.tsx",
    resumen: "Acciones de menor peso: un ícono solo cuando no cabe texto, enlaces para acciones secundarias y el botón punteado para el primer elemento de una lista.",
    uso: ["Botón ícono: flechas para ordenar contactos, quitar un paso.", "Enlace: acciones secundarias dentro de una tarjeta («Editar», «Reenviar invitación»).", "Botón de añadir: solo en listas vacías («Añade tu primer contacto»)."],
    accesibilidad: ["El botón ícono siempre lleva etiqueta con la acción y el objeto: «Subir a Ana».", "El enlace se entiende solo, sin el contexto: «Reenviar invitación», no «Ver más».", "Todos miden al menos 48 px de alto aunque el texto sea pequeño."],
    codigo: `import { BotonIcono, Enlace, BotonAnadir } from "@/components/ds/Boton";

<BotonIcono icono="chevron-up" etiqueta="Subir a Ana" />
<Enlace href="/aviso" icono="pencil" aria-label="Editar aviso">Editar</Enlace>
<BotonAnadir>Añade tu primer contacto</BotonAnadir>`,
    demo: <DemoBotonesMenores />,
  },
  {
    id: "boton-mantener",
    nombre: "Botón para mantener presionado",
    seccion: "02 · Acciones",
    figma: "4002:31792",
    archivo: "components/home/HoldButton.tsx",
    resumen: "Para acciones deliberadas: se confirma manteniendo presionado 2 segundos. Hoy se usa para cancelar una alerta activa. Al terminar, el doble check confirma que quedó hecho.",
    uso: ["Solo para acciones que no deben ocurrir por un toque accidental.", "Siempre con la instrucción visible arriba del botón.", "Si se suelta antes, no pasa nada y el progreso se vacía."],
    accesibilidad: ["Con teclado o lector de pantalla no se puede «mantener»: se activa con un toque y pide confirmar en un segundo paso.", "El progreso se ve en dos lugares a la vez (anillo y relleno), no solo por color.", "Con zoom al 200 % el texto se parte en líneas y el botón crece."],
    codigo: `import HoldButton from "@/components/home/HoldButton";

<HoldButton label="Estoy bien, cancelar alerta" help="Mantén presionado el botón 2 segundos" … onComplete={cancelar} />`,
    demo: <DemoMantener />,
  },
  {
    id: "campo",
    nombre: "Campo de texto",
    seccion: "03 · Formularios y controles",
    figma: "2293:1356",
    archivo: "components/ds/Campo.tsx",
    resumen: "Campo con etiqueta siempre visible, ayuda y error. Tipos: texto, correo, teléfono, contraseña (con mostrar u ocultar) y área de texto con contador.",
    uso: ["La etiqueta va arriba y no desaparece al escribir.", "La ayuda explica el porqué o el formato antes del error.", "El error dice qué pasó y cómo arreglarlo."],
    accesibilidad: ["Etiqueta enlazada al campo; ayuda y error enlazados con aria-describedby.", "El error no depende del color: borde más grueso, ícono y texto, y se anuncia con role=\"alert\".", "El botón de mostrar contraseña dice su estado (aria-pressed)."],
    codigo: `import { Campo, AreaTexto } from "@/components/ds/Campo";

<Campo etiqueta="Correo" tipo="correo" error="Revisa el correo: falta algo después de la arroba." />
<AreaTexto etiqueta="Mensaje para tus contactos" maximo={300} />`,
    demo: <DemoCampo />,
  },
  {
    id: "seleccion",
    nombre: "Interruptor, Control segmento, Casilla y Radio",
    seccion: "03 · Formularios y controles",
    figma: "2942:12332",
    archivo: "components/ds/Seleccion.tsx",
    resumen: "Controles para elegir. El interruptor aplica al instante; el control segmento elige una opción entre dos o tres; casilla y radio viven en listas.",
    uso: ["Interruptor: la etiqueta dice la acción («Toca para apagar tu aviso»), no el estado.", "Control segmento: 2 o 3 opciones cortas que caben en una fila (repetición, tiempo de gracia, mensaje).", "Casilla: una o varias. Radio: solo una, dentro de un grupo con título."],
    accesibilidad: ["Toda la fila es el objetivo táctil (mínimo 48 px).", "El elegido no se distingue solo por color: cambia el peso del texto, la marca o la posición.", "Control segmento: flechas del teclado, como un grupo de radio.", "Interruptor: role=\"switch\" con aria-checked."],
    codigo: `import { Interruptor, ControlSegmentado, Casilla, Radio } from "@/components/ds/Seleccion";

<Interruptor etiqueta="Toca para apagar tu aviso" activado={on} onCambiar={setOn} />
<ControlSegmentado etiqueta="Repetición" valor={v} onCambiar={setV} opciones={[…]} />`,
    demo: <DemoSeleccion />,
  },
  {
    id: "navegacion",
    nombre: "Encabezado, Barra de título, Stepper, Filas y Barra de navegación",
    seccion: "04 · Navegación",
    figma: "3869:28320",
    archivo: "components/ds/Navegacion.tsx",
    resumen: "Las piezas que ubican a la persona: dónde está, cuánto falta y a dónde puede ir. En el ejemplo, toca los destinos de abajo y el botón «Continuar».",
    uso: ["Encabezado con la marca en las cuatro pantallas principales; Barra de título en las internas.", "Stepper en flujos de 2 o 3 pasos, con el nombre del paso que sigue.", "Barra de navegación fija abajo, al alcance del pulgar. No va en flujos de pasos ni en la web de quien recibe.", "Zona de acción: el botón principal queda fijo abajo en los flujos."],
    accesibilidad: ["El destino actual se marca con aria-current y se ve por la píldora y el peso del texto.", "El Stepper da la información en texto («Paso 2 de 3»); la barra es decorativa.", "Cada destino y cada fila miden al menos 48 px."],
    codigo: `import { BarraNavegacion, BarraTitulo, Stepper, Encabezado } from "@/components/ds/Navegacion";

<BarraTitulo titulo="Configurar aviso" volverHref="/home" />
<Stepper actual={2} total={3} siguiente="Siguiente: Contactos" />
<BarraNavegacion destinos={destinos} actual="inicio" />`,
    demo: <DemoNavegacion />,
  },
  {
    id: "badge",
    nombre: "Badge",
    seccion: "05 · Tarjetas y contenido",
    figma: "2675:5424",
    archivo: "components/ds/Contenido.tsx",
    resumen: "Etiqueta de estado. Claro sobre fondos claros, Oscuro para resaltar, Éxito con check y Etiqueta en mayúsculas sin fondo.",
    uso: ["Va en el encabezado de la tarjeta.", "En la tarjeta de Énfasis (oscura) se usa siempre Claro.", "Texto corto: el estado, no una frase."],
    accesibilidad: ["El estado se lee en el texto; el ícono y el color son refuerzo.", "Los nombres de los estados de una alerta no cambian entre marcas."],
    codigo: `import { Badge } from "@/components/ds/Contenido";

<Badge tipo="exito">Aviso activo</Badge>
<Badge icono="clock">Confirmación pendiente</Badge>`,
    demo: <DemoBadges />,
  },
  {
    id: "card",
    nombre: "Card",
    seccion: "05 · Tarjetas y contenido",
    figma: "2675:5520",
    archivo: "components/ds/Contenido.tsx",
    resumen: "La tarjeta del sistema. Tres tonos (Contorno, Neutra y Énfasis) y dos densidades. Sus bloques son opcionales: encabezado, título, dato grande, contenido y acciones.",
    uso: ["Contorno para el contenido normal; Neutra para avisos que piden atención; Énfasis para el momento más importante (tiempo de gracia).", "Una sola tarjeta de Énfasis por pantalla.", "Las tarjetas de aviso, de alerta y de historial son esta misma Card con contenido distinto."],
    accesibilidad: ["El título de cada tarjeta es un encabezado real (h2 o h3).", "En Énfasis el texto pasa a claro solo: contraste 15:1 sobre el fondo oscuro."],
    codigo: `import { Card, Badge, DatoGrande, FilaInfo } from "@/components/ds/Contenido";

<Card tono="enfasis" encabezado={<Badge icono="alarm-clock">Tiempo de gracia</Badge>} titulo="¿Estás bien?">
  <DatoGrande valor="18 min" sufijo="para confirmar" />
</Card>`,
    demo: <DemoCards />,
  },
  {
    id: "contenido",
    nombre: "Filas, Contacto, Paso, Estado vacío y Desplegable",
    seccion: "05 · Tarjetas y contenido",
    figma: "2675:5436",
    archivo: "components/ds/Contenido.tsx",
    resumen: "Lo que va dentro de una tarjeta: pares de dato, personas, pasos numerados, la pantalla sin contenido y las preguntas que se abren.",
    uso: ["Fila de dato: etiqueta a la izquierda y valor a la derecha.", "Contacto: número de orden o iniciales, relación, estado y una acción.", "Estado vacío: dice qué va a pasar aquí, no solo que está vacío.", "Desplegable: para leer una respuesta en el mismo lugar. Para ir a otra pantalla se usa la Fila de navegación."],
    accesibilidad: ["Las filas de dato son una lista de definiciones (dl).", "Los pasos son una lista ordenada (ol).", "El desplegable usa details y summary: funciona con teclado y sin JavaScript."],
    codigo: `import { FilaDato, Contacto, Paso, EstadoVacio, Desplegable } from "@/components/ds/Contenido";

<Contacto nombre="Ana Ruiz" subtitulo="Pareja" orden={1} estado={<Badge tipo="exito">Aceptó</Badge>} />`,
    demo: <DemoContenido />,
  },
  {
    id: "mensajes",
    nombre: "Banner, Toast, Diálogo, Cargando y doble check",
    seccion: "06 · Mensajes del sistema",
    figma: "3693:26723",
    archivo: "components/ds/Mensajes.tsx",
    resumen: "Cómo habla el sistema. El banner se queda hasta que el problema se resuelve, el toast confirma y se va, y el diálogo pide confirmar antes de una acción.",
    uso: ["Banner: error con reintento, sin conexión o envío en curso.", "Toast: confirma algo que ya pasó («Invitación enviada»). Nunca para errores.", "Diálogo: el botón principal dice exactamente lo que va a pasar y Cancelar siempre está.", "Nunca se muestra «confirmado» si el servidor no lo recibió."],
    accesibilidad: ["Ninguno depende del color: siempre ícono y título.", "Error con role=\"alert\"; lo demás con role=\"status\".", "Diálogo: el foco entra al abrir, no sale mientras está abierto, Esc cierra y el foco vuelve al botón que lo abrió.", "Las animaciones se apagan para quien pide menos movimiento."],
    codigo: `import { Banner, Dialogo, DobleCheck } from "@/components/ds/Mensajes";

<Banner tipo="sin-conexion" titulo="Sin conexión">Ves el último dato guardado.</Banner>
<Dialogo abierto={abierto} tipo="destructiva" titulo="¿Eliminar tu cuenta?" confirmar="Eliminar mi cuenta" … />`,
    demo: <DemoMensajes />,
  },
];

const SECCIONES = Array.from(new Set(FICHAS.map((f) => f.seccion)));

export default function Componentes() {
  return (
    <>
      <TituloPagina titulo="Componentes">
        Cada componente existe una sola vez: se diseña en Figma, se construye en <Chip>components/ds</Chip> y el producto lo usa. Todos los ejemplos de esta página son los componentes reales: se pueden tocar, recorrer con el teclado y cambiar de tema.
      </TituloPagina>

      <nav aria-label="Componentes de esta página" className="mb-espacio-2xl rounded-radio-l border border-borde-sutil bg-surface p-espacio-l">
        <ul className="grid gap-x-espacio-xl gap-y-espacio-m sm:grid-cols-2">
          {SECCIONES.map((s) => (
            <li key={s}>
              <p className="text-pequeno font-semibold uppercase tracking-wide text-text-muted">{s}</p>
              <ul>
                {FICHAS.filter((f) => f.seccion === s).map((f) => (
                  <li key={f.id}>
                    <a href={`#${f.id}`} className={`inline-flex min-h-11 items-center rounded-radio-s text-cuerpo underline underline-offset-4 hover:decoration-2 ${FOCO}`}>
                      {f.nombre}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      {FICHAS.map((f) => (
        <article key={f.id} id={f.id} aria-labelledby={`${f.id}-t`} className="mb-espacio-seccion scroll-mt-24">
          <p className="text-pequeno font-semibold uppercase tracking-wide text-text-muted">{f.seccion}</p>
          <h2 id={`${f.id}-t`} className="text-seccion">
            {f.nombre}
          </h2>
          <p className="mt-espacio-xs max-w-2xl text-cuerpo text-text-muted">{f.resumen}</p>
          <div className="mt-espacio-xs flex flex-wrap items-center gap-x-espacio-l">
            <EnlaceExterno href={enFigma(f.figma)}>Ver en Figma</EnlaceExterno>
            <span className="text-pequeno text-text-muted">
              Código: <Chip>{f.archivo}</Chip>
            </span>
          </div>
          <Lienzo className="mt-espacio-l">{f.demo}</Lienzo>
          <div className="mt-espacio-l grid gap-espacio-l md:grid-cols-2">
            <Lista titulo="Cómo se usa" items={f.uso} />
            <Lista titulo="Accesibilidad" items={f.accesibilidad} />
          </div>
          <div className="mt-espacio-l">
            <Codigo>{f.codigo}</Codigo>
          </div>
        </article>
      ))}
    </>
  );
}

function Lista({ titulo, items }: { titulo: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-etiqueta">{titulo}</h3>
      <ul className="mt-espacio-s flex list-disc flex-col gap-espacio-xs pl-5 text-cuerpo text-text-muted marker:text-borde-control">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
