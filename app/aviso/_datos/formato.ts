// Formato de hora y tiempo según la Biblioteca de componentes (00 · Formato de hora y fecha):
// 12 horas con «a. m.» / «p. m.», sin cero inicial, espacios que no se cortan.
// Sirve en servidor y en navegador.

const NBSP = " ";

/** "20:05" → "8:05 p. m." */
export function horaCorta(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const sufijo = h < 12 ? `a.${NBSP}m.` : `p.${NBSP}m.`;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")}${NBSP}${sufijo}`;
}

/** Para lector de pantalla: "8:05 de la noche". */
export function horaLarga(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const franja = h < 6 ? "de la madrugada" : h < 12 ? "de la mañana" : h < 20 ? "de la tarde" : "de la noche";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${franja}`;
}

/** 15 → "15 min", 60 → "1 h", 90 → "1 h 30 min". */
export function duracion(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h && m) return `${h}${NBSP}h ${m}${NBSP}min`;
  if (h) return `${h}${NBSP}h`;
  return `${m}${NBSP}min`;
}

/** Para lector de pantalla: "1 hora 30 minutos". */
export function duracionLarga(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  const partes: string[] = [];
  if (h) partes.push(`${h} ${h === 1 ? "hora" : "horas"}`);
  if (m) partes.push(`${m} ${m === 1 ? "minuto" : "minutos"}`);
  return partes.join(" ");
}

// Lunes primero, como en el Selector de días (L M X J V S D). Valor = getDay() (0 = domingo).
export const DIAS = [
  { valor: 1, corto: "L", nombre: "lunes" },
  { valor: 2, corto: "M", nombre: "martes" },
  { valor: 3, corto: "X", nombre: "miércoles" },
  { valor: 4, corto: "J", nombre: "jueves" },
  { valor: 5, corto: "V", nombre: "viernes" },
  { valor: 6, corto: "S", nombre: "sábado" },
  { valor: 0, corto: "D", nombre: "domingo" },
] as const;

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];

/** Día relativo: "hoy", "ayer", día de la semana si fue esta semana, si no "12 oct" (año solo si no es el actual). */
export function diaRelativo(fecha: Date, ahora = new Date()): string {
  const inicio = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dias = Math.round((inicio(ahora) - inicio(fecha)) / 86_400_000);
  if (dias === 0) return "hoy";
  if (dias === 1) return "ayer";
  if (dias > 1 && dias < 7) return DIAS.find((d) => d.valor === fecha.getDay())?.nombre ?? "";
  const base = `${fecha.getDate()}${NBSP}${MESES[fecha.getMonth()]}`;
  return fecha.getFullYear() === ahora.getFullYear() ? base : `${base} ${fecha.getFullYear()}`;
}

/** "Ana", "Ana y Luis", "Ana, Luis y Jorge". */
export function listaNombres(nombres: string[]): string {
  if (nombres.length <= 1) return nombres[0] ?? "";
  return `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
}

/** Primer nombre para frases cortas ("Ana Ruiz" → "Ana"). */
export function primerNombre(nombre: string): string {
  return nombre.trim().split(/\s+/)[0] ?? nombre;
}

/**
 * Próxima vez que llega la hora elegida, en la hora local del navegador.
 * once: hoy (null si ya pasó). daily: hoy o mañana. weekly: el próximo día elegido.
 */
export function proximoPlazo(hhmm: string, frecuencia: "once" | "daily" | "weekly", dias: number[], ahora = new Date()): Date | null {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const margen = 60_000;
  for (let i = 0; i < 8; i++) {
    const d = new Date(ahora);
    d.setDate(ahora.getDate() + i);
    d.setHours(h, m, 0, 0);
    if (d.getTime() - ahora.getTime() < margen) continue;
    if (frecuencia === "once") return i === 0 ? d : null;
    if (frecuencia === "daily") return d;
    if (dias.includes(d.getDay())) return d;
  }
  return null;
}
