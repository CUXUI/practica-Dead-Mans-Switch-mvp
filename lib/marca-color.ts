// Color de marca que cada persona elige en Ajustes. Se guarda en una cookie (no en la base) para que
// el servidor ya sepa el color al pintar la página y no haya parpadeo. Vale en cualquier cliente (servidor y navegador).

export const MARCAS_COLOR = ["base", "cerca", "montana"] as const;
export type MarcaColor = (typeof MARCAS_COLOR)[number];

export const COOKIE_MARCA_COLOR = "marca_color";

export function leerMarcaColor(valor: string | undefined | null): MarcaColor {
  return (MARCAS_COLOR as readonly string[]).includes(valor ?? "") ? (valor as MarcaColor) : "base";
}

// Clase que se pone en <html>. "base" no lleva clase: es el color del design system por defecto.
export function claseMarcaColor(marca: MarcaColor): string {
  return marca === "base" ? "" : `marca-${marca}`;
}
