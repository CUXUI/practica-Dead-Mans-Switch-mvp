"use client";

import { useState } from "react";
import ControlAviso from "./ControlAviso";
import type { TextosInicio } from "./textosInicio";
import type { Frecuencia } from "@/app/aviso/_datos/tipos";
import { proximoPlazo } from "@/app/aviso/_datos/formato";

const pad = (n: number) => String(n).padStart(2, "0");

// Atajo para programar la hora desde Inicio, sin ir a editar el aviso. Solo se muestra con el aviso apagado;
// al encenderlo, esta hora pasa a ser el plazo. Para más opciones (mensaje, contactos) se usa Editar.
function calcularPlazo(h12: number, minuto: number, ampm: "am" | "pm", frecuencia: Frecuencia, dias: number[]): Date | null {
  const h24 = (h12 % 12) + (ampm === "pm" ? 12 : 0);
  const d = new Date();
  d.setHours(h24, minuto, 0, 0);
  if (d.getTime() - Date.now() >= 60_000) return d;
  if (frecuencia === "once") {
    d.setDate(d.getDate() + 1);
    return d;
  }
  return proximoPlazo(`${pad(h24)}:${pad(minuto)}`, frecuencia, dias);
}

export default function EncenderConHora({
  t,
  fireAt,
  frecuencia,
  dias,
  estado,
  detalle,
}: {
  t: TextosInicio;
  fireAt: string;
  frecuencia: Frecuencia;
  dias: number[];
  estado: string;
  detalle: string;
}) {
  const inicial = new Date(fireAt);
  const [h12, setH12] = useState(inicial.getHours() % 12 || 12);
  const [minuto, setMinuto] = useState(inicial.getMinutes());
  const [ampm, setAmpm] = useState<"am" | "pm">(inicial.getHours() >= 12 ? "pm" : "am");
  const [elegido, setElegido] = useState<string | null>(null);
  const [sinPlazo, setSinPlazo] = useState(false);

  function cambiar(nuevo: { h12?: number; minuto?: number; ampm?: "am" | "pm" }) {
    const H = nuevo.h12 ?? h12;
    const M = nuevo.minuto ?? minuto;
    const A = nuevo.ampm ?? ampm;
    setH12(H);
    setMinuto(M);
    setAmpm(A);
    const plazo = calcularPlazo(H, M, A, frecuencia, dias);
    setSinPlazo(plazo === null);
    setElegido(plazo ? plazo.toISOString() : null);
  }

  const campo =
    "min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-text focus:outline-2 focus:outline-brand-primary";

  return (
    <div className="space-y-3">
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">{t.atajo.titulo}</legend>
        <div className="flex flex-wrap gap-2">
          <label className="flex flex-col text-xs text-text-muted">
            {t.atajo.hora}
            <select className={campo} value={h12} onChange={(e) => cambiar({ h12: Number(e.target.value) })}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-xs text-text-muted">
            {t.atajo.minutos}
            <select className={campo} value={minuto} onChange={(e) => cambiar({ minuto: Number(e.target.value) })}>
              {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                <option key={m} value={m}>{pad(m)}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-xs text-text-muted">
            <span className="sr-only">a. m. o p. m.</span>
            <select className={campo} value={ampm} onChange={(e) => cambiar({ ampm: e.target.value as "am" | "pm" })}>
              <option value="am">{t.atajo.am}</option>
              <option value="pm">{t.atajo.pm}</option>
            </select>
          </label>
        </div>
        <p className="text-xs text-text-muted">{t.atajo.ayuda}</p>
        {sinPlazo && <p role="status" className="text-sm text-danger">{t.atajo.sinDia}</p>}
      </fieldset>

      <ControlAviso
        t={t}
        encendido={false}
        fireAt={elegido ?? fireAt}
        frecuencia={frecuencia}
        dias={dias}
        estado={estado}
        detalle={detalle}
      />
    </div>
  );
}
