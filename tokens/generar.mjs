// Genera app/tokens.css y lib/ds/tokens.ts a partir de tokens/tokens.json.
// Sin dependencias: `npm run tokens`. No editar los archivos generados a mano.
//
// Los nombres de las variables CSS son los mismos que exporta Supernova para Tailwind 4
// (--color-fondo-lienzo, --text-color-principal, --spacing-espacio-l…), así el día que el
// export de Supernova esté completo se puede reemplazar este paso sin tocar componentes.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const t = JSON.parse(readFileSync(join(raiz, "tokens/tokens.json"), "utf8"));

const kebab = (nombre) => nombre.replaceAll("/", "-");
// texto/* y estado/texto son colores de texto: en Tailwind 4 viven en --text-color-*.
const variableColor = (nombre) => {
  if (nombre === "estado/texto") return "--text-color-estado-o"; // nombre que ya usa el export de Supernova
  if (nombre.startsWith("texto/")) return `--text-color-${kebab(nombre.slice(6))}`;
  return `--color-${kebab(nombre)}`;
};
const temas = Object.keys(t.temas);
const valorDe = (v, tema) => (typeof v === "string" ? v : v[tema]);
const entradas = (grupo) => Object.entries(grupo).filter(([k]) => !k.startsWith("$"));

const l = [];
l.push("/* GENERADO por tokens/generar.mjs a partir de tokens/tokens.json. No editar a mano. */");
l.push("");
l.push("@theme {");
l.push("  /* Solo existen los colores del sistema: se quita la paleta por defecto de Tailwind. */");
l.push("  --color-*: initial;");
l.push("");
l.push("  /* Color · semánticos (tema Base) */");
for (const [n, d] of entradas(t.color)) l.push(`  ${variableColor(n)}: ${valorDe(d.valor, "base")}; /* ${d.uso} */`);
l.push("  /* estado/texto también como color de fondo y borde (íconos, marcadores) */");
l.push(`  --color-estado-texto: ${t.color["estado/texto"].valor};`);
l.push("");
l.push("  /* Color · primitivos */");
for (const [n, d] of entradas(t.colorPrimitivo)) l.push(`  --color-${kebab(n)}: ${d.valor}; /* ${d.uso} */`);
l.push("");
l.push("  /* Color · extensión en código (pendiente en Figma) */");
for (const [n, d] of entradas(t.colorExtension)) l.push(`  --color-${kebab(n)}: ${d.valor}; /* ${d.uso} */`);
l.push("");
l.push("  /* Espacio y tamaño */");
for (const [n, d] of [...entradas(t.espacio), ...entradas(t.tamano)]) l.push(`  --spacing-${kebab(n)}: ${d.valor}px; /* ${d.uso} */`);
l.push("");
l.push("  /* Radio (--spacing-radio-* se mantiene por compatibilidad con el export de Supernova) */");
for (const [n, d] of entradas(t.radio)) {
  l.push(`  --spacing-${kebab(n)}: ${d.valor}px;`);
  // rounded-radio-m: se mantiene el prefijo para no chocar con rounded-s / rounded-l de Tailwind (lados).
  l.push(`  --radius-${kebab(n)}: ${d.valor}px; /* ${d.uso} */`);
}
l.push("");
l.push("  /* Tipografía */");
l.push(`  --font-sans: var(--fuente-inter, "${t.tipografia.familia}"), system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;`);
for (const [n, p] of Object.entries(t.tipografia.pesos)) l.push(`  --font-weight-${n}: ${p};`);
for (const [n, e] of Object.entries(t.tipografia.estilos)) {
  l.push(`  --text-${e.clase}: ${e.tamano}px; /* ${n} · ${e.uso} */`);
  l.push(`  --text-${e.clase}--line-height: ${e.interlinea}px;`);
  l.push(`  --text-${e.clase}--font-weight: ${e.peso};`);
}
l.push("");
l.push("  /* Movimiento */");
for (const [n, d] of entradas(t.movimiento)) {
  const prop = n.startsWith("duracion/") ? `--duracion-${n.slice(9)}` : `--ease-${n.slice(6)}`;
  l.push(`  ${prop}: ${d.valor}; /* ${d.uso} */`);
}
l.push("}");
l.push("");
l.push("/* Temas de marca. Se activan con data-tema en <html> o en cualquier contenedor. */");
for (const tema of temas.filter((x) => x !== "base")) {
  const cambios = entradas(t.color).filter(([, d]) => typeof d.valor !== "string");
  l.push(`[data-tema="${tema}"] {`);
  for (const [n, d] of cambios) l.push(`  ${variableColor(n)}: ${d.valor[tema]};`);
  l.push("}");
}
l.push('[data-tema="base"] {');
for (const [n, d] of entradas(t.color).filter(([, d]) => typeof d.valor !== "string")) l.push(`  ${variableColor(n)}: ${d.valor.base};`);
l.push("}");
l.push("");
writeFileSync(join(raiz, "app/tokens.css"), l.join("\n"));

// Los mismos datos, tipados, para la documentación viva (/design-system).
mkdirSync(join(raiz, "lib/ds"), { recursive: true });
const ts = `// GENERADO por tokens/generar.mjs a partir de tokens/tokens.json. No editar a mano.
export const TOKENS = ${JSON.stringify(t, null, 2)} as const;

export type Tema = ${temas.map((x) => `"${x}"`).join(" | ")};
export const TEMAS: readonly Tema[] = ${JSON.stringify(temas)};
`;
writeFileSync(join(raiz, "lib/ds/tokens.ts"), ts);
console.log(`Tokens generados: app/tokens.css y lib/ds/tokens.ts (${temas.length} temas).`);
