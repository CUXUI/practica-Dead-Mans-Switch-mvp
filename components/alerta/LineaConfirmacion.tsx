"use client";

import { useEffect, useState } from "react";
import type { Variant } from "@/lib/brand";
import { textosAlerta } from "./textos";

// Las horas se muestran en la zona horaria de quien abre el enlace (su celular o computadora),
// no en la del servidor (UTC) ni en una fija. Por eso se formatean en el navegador, después de montar.

function hora(fecha: Date): string {
  return fecha.toLocaleTimeString("es-AR", { hour: "numeric", minute: "2-digit" });
}

function mismoDia(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

// "hoy a las 7:48 p. m.", "ayer a las 7:48 p. m." o la fecha completa.
function cuandoConfirmo(fecha: Date, ahora: Date): string {
  if (mismoDia(fecha, ahora)) return `hoy a las ${hora(fecha)}`;
  const ayer = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
  if (mismoDia(fecha, ayer)) return `ayer a las ${hora(fecha)}`;
  const dia = fecha.toLocaleDateString("es-AR", { day: "numeric", month: "long" });
  return `el ${dia} a las ${hora(fecha)}`;
}

export default function LineaConfirmacion({
  variant,
  horaIso,
  ultimaIso,
}: {
  variant: Variant;
  horaIso: string;
  ultimaIso: string | null;
}) {
  const [texto, setTexto] = useState<string | null>(null);

  useEffect(() => {
    const t = textosAlerta(variant);
    const ahora = new Date();
    const debia = t.debiaConfirmar(hora(new Date(horaIso)));
    const ultima = ultimaIso ? ` ${t.ultimaSenal(cuandoConfirmo(new Date(ultimaIso), ahora))}` : "";
    setTexto(`${debia}${ultima}`);
  }, [variant, horaIso, ultimaIso]);

  // Antes de montar en el navegador no hay hora local que mostrar: se reserva el espacio.
  return <p className="text-text-muted" aria-live="polite">{texto ?? " "}</p>;
}
