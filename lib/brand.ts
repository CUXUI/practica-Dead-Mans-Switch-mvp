// Marca blanca: una sola app, dos versiones. Cambian nombre y colores; los pasos son los mismos.
// Los colores se definen como tokens en app/globals.css (ver AGENTS.md sección 5).

export type Variant = "cerca" | "montana";

export type Brand = {
  variant: Variant;
  name: string;
  description: string;
  themeColor: string;
};

const BRANDS: Record<Variant, Brand> = {
  cerca: {
    variant: "cerca",
    name: "Cerca",
    description: "Avisá que estás bien. Si dejás de avisar, tus contactos de confianza lo saben.",
    themeColor: "#1f4e5f",
  },
  montana: {
    variant: "montana",
    name: "Montaña",
    description: "Salí tranquila. Si no volvés a la hora, tus contactos de confianza lo saben.",
    themeColor: "#2f5d3a",
  },
};

export function getBrand(): Brand {
  const v = process.env.APP_VARIANT === "montana" ? "montana" : "cerca";
  return BRANDS[v];
}
