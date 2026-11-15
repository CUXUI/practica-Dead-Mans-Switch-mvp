"use client";

import { useEffect, useState } from "react";
import { CONFIG_EMISOR } from "@/app/aviso/_datos/config";

// "Editar" del Inicio con el aviso encendido: desactivado mientras está encendido, y no se ve en los
// 30 min previos a la hora (ni se apaga ni se edita; el bloque de abajo lo explica).
export default function EditarActivo({ fireAt, texto, aria, titulo }: { fireAt: string; texto: string; aria: string; titulo: string }) {
  const [bloqueado, setBloqueado] = useState(false);

  useEffect(() => {
    const calcula = () => setBloqueado(Date.now() >= new Date(fireAt).getTime() - CONFIG_EMISOR.ventanaConfirmarMin * 60_000);
    calcula();
    const id = setInterval(calcula, 30_000);
    return () => clearInterval(id);
  }, [fireAt]);

  if (bloqueado) return null;
  return (
    <button
      type="button"
      disabled
      aria-label={aria}
      title={titulo}
      className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4 opacity-50 disabled:cursor-not-allowed"
    >
      {texto}
    </button>
  );
}
