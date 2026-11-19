"use client";

import { clases } from "@/components/emisor/ui";

// Selector de hora propio: siempre en 12 h con a. m. / p. m., igual en todos los navegadores
// (el <input type="time"> cambia según el equipo). Recibe y devuelve "HH:MM" en 24 h.
export default function SelectorHora({
  id,
  valor,
  onChange,
  invalido,
  descritoPor,
  t,
}: {
  id: string;
  valor: string;
  onChange: (hhmm: string) => void;
  invalido?: boolean;
  descritoPor?: string;
  t: { hora: string; minutos: string; momento: string };
}) {
  const [hh, mm] = valor.split(":").map(Number);
  const h24 = Number.isNaN(hh) ? 0 : hh;
  const min = Number.isNaN(mm) ? 0 : mm;
  const pm = h24 >= 12;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;

  // Minutos de 5 en 5. Si la hora guardada tiene otro minuto, también se ofrece.
  const minutos = Array.from({ length: 12 }, (_, i) => i * 5);
  if (!minutos.includes(min)) minutos.push(min);
  minutos.sort((a, b) => a - b);

  const emitir = (h: number, m: number, esPm: boolean) => {
    const hora24 = (h % 12) + (esPm ? 12 : 0);
    onChange(`${String(hora24).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  };

  return (
    // Con zoom al 200 % los tres selectores no caben en una fila: pasan a filas nuevas en vez de apretarse
    // hasta ocultar el valor elegido. 5,5 rem es lo mínimo para ver «12», «55» o «p. m.» junto a la flecha.
    <div className="flex flex-wrap gap-3" role="group" aria-labelledby={`${id}-etiqueta`} aria-describedby={descritoPor}>
      <div className="min-w-[5.5rem] flex-1">
        <select
          id={id}
          aria-label={t.hora}
          aria-invalid={invalido}
          className={clases.campo}
          value={h12}
          onChange={(e) => emitir(Number(e.target.value), min, pm)}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-[5.5rem] flex-1">
        <select
          aria-label={t.minutos}
          aria-invalid={invalido}
          className={clases.campo}
          value={min}
          onChange={(e) => emitir(h12, Number(e.target.value), pm)}
        >
          {minutos.map((m) => (
            <option key={m} value={m}>
              {String(m).padStart(2, "0")}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-[5.5rem] flex-1">
        <select
          aria-label={t.momento}
          aria-invalid={invalido}
          className={clases.campo}
          value={pm ? "pm" : "am"}
          onChange={(e) => emitir(h12, min, e.target.value === "pm")}
        >
          <option value="am">a. m.</option>
          <option value="pm">p. m.</option>
        </select>
      </div>
    </div>
  );
}
