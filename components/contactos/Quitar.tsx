"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { quitarContacto, type EstadoQuitar } from "@/app/contactos/actions";
import { clases } from "@/components/emisor/ui";
import Spinner from "@/components/emisor/Spinner";
import type { TextosContactos } from "./textos";

// E5 · Quitar un contacto. Acción que no se deshace sola: pide confirmar en el mismo sitio.
export default function Quitar({
  contactId,
  nombre,
  estado: estadoContacto,
  t,
}: {
  contactId: string;
  nombre: string;
  estado: "pending" | "sinEnviar" | "accepted" | "rejected";
  t: TextosContactos["lista"];
}) {
  const consecuencia = estadoContacto === "accepted" ? t.quitarAceptado : estadoContacto === "pending" ? t.quitarPendiente : estadoContacto === "sinEnviar" ? t.quitarSinEnviar : t.quitarRechazado;
  const [estado, accion, enviando] = useActionState<EstadoQuitar, FormData>(quitarContacto, {});
  const [abierto, setAbierto] = useState(false);
  const pregunta = useRef<HTMLParagraphElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (abierto) pregunta.current?.focus();
  }, [abierto]);

  if (!abierto) {
    return (
      <button ref={boton} type="button" className={clases.enlace} onClick={() => setAbierto(true)} aria-label={`${t.quitar}: ${nombre}`}>
        {t.quitar}
      </button>
    );
  }

  return (
    <form action={accion} className="w-full space-y-2 rounded-lg bg-surface-muted p-3">
      <input type="hidden" name="contact_id" value={contactId} />
      <p ref={pregunta} tabIndex={-1} className="font-semibold">
        {t.quitarPregunta.replace("{nombre}", nombre)}
      </p>
      <p className="text-sm text-text-muted">{consecuencia}</p>
      {estado.error && (
        <p role="alert" className={clases.error}>
          {estado.error}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={enviando} className={clases.principal}>
          {enviando ? (<span className="inline-flex items-center gap-2"><Spinner className="size-4" />{t.quitando}</span>) : t.quitarSi}
        </button>
        <button type="button" disabled={enviando} className={clases.secundario} onClick={() => setAbierto(false)}>
          {t.quitarNo}
        </button>
      </div>
    </form>
  );
}
