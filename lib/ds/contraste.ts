// Contraste WCAG 2.x entre dos colores hex (#rrggbb). Lo usa la documentación para mostrar cada par con su número.
function luminancia(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const canal = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal((n >> 16) & 255) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255);
}

export function contraste(a: string, b: string): number {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100;
}

// AA: 4,5:1 en texto y 3:1 en controles y texto grande. AAA: 7:1.
export function nivel(c: number, uso: "texto" | "control" = "texto"): "AAA" | "AA" | "No cumple" {
  if (c >= 7) return "AAA";
  return c >= (uso === "texto" ? 4.5 : 3) ? "AA" : "No cumple";
}
