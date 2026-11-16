// Clases del Action Button de la Biblioteca (02 · Acciones), con los tokens de app/globals.css.
// Alto mínimo 48, radio 12, Inter 16/24 en negrita. Foco: anillo de 3 px separado 2 px.
const BASE =
  "inline-flex min-h-12 w-full items-center justify-center gap-espacio-s rounded-[var(--spacing-radio-m)] px-espacio-xl text-base font-bold leading-6 disabled:cursor-not-allowed focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-foco-anillo";

export const boton = {
  principal: `${BASE} bg-brand-primary text-brand-on-primary disabled:bg-accion-desactivada disabled:text-[var(--text-color-sobre-desactivada)]`,
  secundario: `${BASE} border border-border bg-surface text-text disabled:border-accion-desactivada disabled:text-[var(--text-color-sobre-desactivada)]`,
};

// Card con Contorno, densidad Normal: relleno 16/24, radio 16, borde sutil.
export const tarjeta = "flex flex-col gap-espacio-m rounded-[var(--spacing-radio-l)] border border-borde-sutil bg-surface px-espacio-xl py-espacio-l";
