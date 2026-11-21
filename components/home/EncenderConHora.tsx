"use client";

import { useState } from "react";
import ControlAviso from "./ControlAviso";
import SelectorHora from "@/components/aviso/SelectorHora";
import type { TextosInicio } from "./textosInicio";
import type { Frecuencia } from "@/app/aviso/_datos/tipos";
import { proximoPlazo } from "@/app/aviso/_datos/formato";

const pad = (n: number) => String(n).padStart(2, "0");

// Hora "HH:MM" (24 h) -> Date del próximo plazo, según la frecuencia del aviso.
function calcularPlazo(hhmm: string, frecuencia: Frecuencia, dias: number[]): Date | null {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  if (d.getTime() - Date.now() >= 60_000) return d;
  if (frecuencia === "once") {
    d.setDate(d.getDate() + 1);
    return d;
  }
  return proximoPlazo(`${pad(h)}:${pad(m)}`, frecuencia, dias);
}

// Atajo para programar la hora desde Inicio, sin ir a editar el aviso. Solo se muestra con el aviso apagado;
// al encenderlo, esta hora pasa a ser el plazo. Para más opciones (mensaje, contactos) se usa Editar.
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
  const [hora, setHora] = useState(`${pad(inicial.getHours())}:${pad(inicial.getMinutes())}`);
  const [elegido, setElegido] = useState<string | null>(null);
  const [sinPlazo, setSinPlazo] = useState(false);

  function cambiar(nueva: string) {
    setHora(nueva);
    const plazo = calcularPlazo(nueva, frecuencia, dias);
    setSinPlazo(plazo === null);
    setElegido(plazo ? plazo.toISOString() : null);
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <p id="hora-atajo-etiqueta" className="text-sm font-semibold">{t.atajo.titulo}</p>
        <SelectorHora
          id="hora-atajo"
          valor={hora}
          onChange={cambiar}
          invalido={sinPlazo}
          descritoPor="hora-atajo-ayuda"
          t={{ hora: t.atajo.hora, minutos: t.atajo.minutos, momento: t.atajo.momento }}
        />
        <p id="hora-atajo-ayuda" className="text-xs text-text-muted">{t.atajo.ayuda}</p>
        {sinPlazo && <p role="status" className="text-sm text-danger">{t.atajo.sinDia}</p>}
      </div>

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
