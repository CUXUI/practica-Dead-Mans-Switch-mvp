"use client";

import { useEffect, useState } from "react";
import { CONFIG_EMISOR } from "@/app/aviso/_datos/config";
import { DIAS, diaRelativo, horaCorta } from "@/app/aviso/_datos/formato";
import type { Frecuencia } from "@/app/aviso/_datos/tipos";
import type { TextosInicio } from "./textosInicio";

// Frecuencia, hora y próxima confirmación del aviso encendido (E-02 Activo). Se calcula en el
// navegador: la hora del servidor puede ser otra zona horaria.
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

// Una hora con la cifra en negrita y "a. m." / "p. m." pequeño al lado, para que no queden letras sueltas.
// El texto es el mismo ("1:45 a. m."), solo cambia cómo se ve.
function Hora({ valor, grande = false }: { valor: string; grande?: boolean }) {
  const [cifra, ...resto] = horaCorta(valor).split(/\s/);
  return (
    <span className="whitespace-nowrap">
      <span className={`font-semibold tabular-nums text-text ${grande ? "text-2xl" : ""}`}>{cifra}</span>{" "}
      <span className="text-sm text-text-muted">{resto.join(" ")}</span>
    </span>
  );
}

export default function PlazoActivo({
  t,
  fireAt,
  frecuencia,
  dias,
  activadoEn,
}: {
  t: TextosInicio;
  fireAt: string;
  frecuencia: Frecuencia;
  dias: number[];
  // Hora en que se encendió el aviso. Sin dato (avisos encendidos antes), se usa el inicio de la ventana.
  activadoEn?: string | null;
}) {
  const [listo, setListo] = useState(false);
  useEffect(() => setListo(true), []);
  if (!listo) return <div aria-hidden="true" className="min-h-24" />;

  const plazo = new Date(fireAt);
  const desde = activadoEn ? new Date(activadoEn) : new Date(plazo.getTime() - CONFIG_EMISOR.ventanaConfirmarMin * 60_000);
  const cuando =
    frecuencia === "daily"
      ? t.frecuenciaDiaria
      : frecuencia === "weekly"
        ? DIAS.filter((d) => dias.includes(d.valor))
            .map((d) => d.nombre)
            .join(", ")
            .replace(/^./, (c) => c.toUpperCase())
        : t.frecuenciaHoy;
  const dia = diaRelativo(plazo);
  const diaTexto = (dia === "hoy" ? "Hoy" : dia === "ayer" ? "Ayer" : dia).replace(/^./, (c) => c.toUpperCase());
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-text-muted">{cuando}</p>
        <p>
          {t.regreso} <Hora valor={hhmm(plazo)} />
        </p>
      </div>
      <div className="space-y-2 border-t border-border/40 pt-4">
        <p className="font-semibold">
          {t.proximaConfirmacion} <span className="font-normal text-text-muted">· {diaTexto}</span>
        </p>
        <div className="flex gap-8">
          <div>
            <p className="text-sm text-text-muted">{t.ventanaDesde}</p>
            <Hora valor={hhmm(desde)} grande />
          </div>
          <div>
            <p className="text-sm text-text-muted">{t.ventanaHasta}</p>
            <Hora valor={hhmm(plazo)} grande />
          </div>
        </div>
      </div>
    </div>
  );
}
