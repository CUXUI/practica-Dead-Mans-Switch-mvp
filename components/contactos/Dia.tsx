"use client";

import { useEffect, useState } from "react";
import { diaRelativo } from "@/app/aviso/_datos/formato";

// Fecha relativa calculada en el navegador (la hora del servidor puede ser otra zona horaria).
// "hoy" / "ayer" van sin "el"; el resto lleva "el" ("el lunes", "el 3 oct").
export default function Dia({ iso, prefijo }: { iso: string; prefijo: string }) {
  const [texto, setTexto] = useState<string | null>(null);
  useEffect(() => {
    const d = diaRelativo(new Date(iso));
    setTexto(d === "hoy" || d === "ayer" ? d : `el ${d}`);
  }, [iso]);
  return (
    <span>
      {prefijo}
      {texto ? ` ${texto}` : ""}
    </span>
  );
}
