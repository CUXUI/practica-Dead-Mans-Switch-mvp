// Recetas de clases del design system. Una sola fuente para los componentes de /components/ds y para las
// piezas que cada flujo ya tenía (emisor, cuenta, invitación, baja, landing): todas importan de aquí.
// Solo tokens (app/tokens.css). Medidas de la Biblioteca de Figma: alto mínimo 48, radio 12 en controles
// y 16 en tarjetas, foco de 3 px separado 2 px en foco/anillo.

export const FOCO = "focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-foco-anillo";
export const TRANSICION = "transition-colors duration-(--duracion-rapida) ease-estandar motion-reduce:transition-none";

// Action Button (02 · Acciones). Texto «Botón» 16/24 Bold.
const BOTON_BASE = `inline-flex min-h-12 items-center justify-center gap-espacio-s rounded-radio-m px-espacio-xl py-espacio-s text-center text-boton ${TRANSICION} ${FOCO} disabled:cursor-not-allowed aria-disabled:cursor-not-allowed`;
const PRINCIPAL =
  "bg-brand-primary text-brand-on-primary hover:bg-accion-principal-pulsada active:bg-accion-principal-pulsada disabled:bg-accion-desactivada disabled:text-sobre-desactivada aria-disabled:bg-accion-desactivada aria-disabled:text-sobre-desactivada";
const SECUNDARIO =
  "border border-border bg-surface text-text hover:bg-fondo-sutil active:bg-estado-aviso-fondo disabled:border-accion-desactivada disabled:bg-surface disabled:text-sobre-desactivada aria-disabled:border-accion-desactivada aria-disabled:text-sobre-desactivada";

export const boton = {
  base: BOTON_BASE,
  principal: `${BOTON_BASE} w-full ${PRINCIPAL}`,
  secundario: `${BOTON_BASE} w-full ${SECUNDARIO}`,
  // Mismo botón, ancho según el contenido (barras, landing).
  principalAjustado: `${BOTON_BASE} ${PRINCIPAL}`,
  secundarioAjustado: `${BOTON_BASE} ${SECUNDARIO}`,
  // Botón ícono: 48 × 48, siempre con etiqueta accesible.
  icono: `inline-flex size-12 shrink-0 items-center justify-center rounded-radio-m border border-border bg-surface text-text hover:bg-fondo-sutil active:bg-fondo-sutil disabled:cursor-not-allowed disabled:border-borde-sutil disabled:text-sobre-desactivada ${TRANSICION} ${FOCO}`,
  // Botón de añadir: borde punteado, para el primer elemento de una lista vacía.
  anadir: `inline-flex min-h-16 w-full items-center justify-center gap-espacio-s rounded-radio-m border-2 border-dashed border-border bg-surface px-espacio-xl py-espacio-m text-etiqueta text-text hover:bg-fondo-sutil active:bg-estado-aviso-fondo disabled:cursor-not-allowed disabled:border-accion-desactivada disabled:text-sobre-desactivada ${TRANSICION} ${FOCO}`,
};

// Enlace (02 · Acciones). Texto «Etiqueta/Subrayada», área táctil de 48 px.
export const enlace = `inline-flex min-h-12 items-center gap-espacio-xs rounded-radio-s text-etiqueta text-text underline underline-offset-4 hover:decoration-2 active:text-accion-principal-pulsada aria-disabled:text-sobre-desactivada aria-disabled:no-underline ${FOCO}`;

// Campo/Input (03 · Formularios y controles).
export const campo = {
  etiqueta: "mb-espacio-xs block text-etiqueta text-text",
  control: `w-full min-h-12 rounded-radio-m border border-border bg-surface px-espacio-l py-espacio-s text-cuerpo text-text placeholder:text-text-muted disabled:cursor-not-allowed disabled:border-borde-sutil disabled:bg-fondo-sutil disabled:text-text-muted aria-[invalid=true]:border-2 aria-[invalid=true]:border-danger ${FOCO}`,
  ayuda: "mt-espacio-xs text-pequeno text-text-muted",
  error: "mt-espacio-xs flex items-start gap-espacio-xs text-pequeno font-semibold text-danger",
};

// Card (05 · Tarjetas y contenido). Tono × Densidad.
const CARD_TONO = {
  contorno: "border border-borde-sutil bg-surface text-text",
  neutra: "bg-estado-aviso-fondo text-text",
  enfasis: "bg-fondo-inverso text-inverso",
};
const CARD_DENSIDAD = {
  normal: "gap-espacio-m rounded-radio-l px-espacio-xl py-espacio-l",
  compacta: "gap-espacio-s rounded-radio-m px-espacio-l py-espacio-s",
};
export type TonoCard = keyof typeof CARD_TONO;
export type DensidadCard = keyof typeof CARD_DENSIDAD;
export const card = (tono: TonoCard = "contorno", densidad: DensidadCard = "normal") =>
  `flex flex-col ${CARD_TONO[tono]} ${CARD_DENSIDAD[densidad]}`;

// Badge (05 · Tarjetas y contenido).
const BADGE_BASE = "inline-flex min-h-8 max-w-full items-center gap-espacio-s rounded-radio-pill px-espacio-s py-espacio-xs text-pequeno";
export const badge = {
  claro: `${BADGE_BASE} bg-fondo-sutil text-text`,
  oscuro: `${BADGE_BASE} bg-fondo-inverso text-inverso`,
  exito: `${BADGE_BASE} bg-estado-exito-fondo text-estado-o border border-borde-sutil`,
  etiqueta: "inline-flex items-center gap-espacio-s text-pequeno font-semibold uppercase tracking-wide text-text-muted",
};
export type TipoBadge = keyof typeof badge;
