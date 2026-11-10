"use client";

import { useActionState } from "react";
import { reenviarInvitacion, type EstadoReenviar } from "@/app/contactos/actions";
import { clases } from "@/components/emisor/ui";
import type { TextosContactos } from "./textos";

// E5 · Reenviar (decidido el 2/11). Solo dice "reenviada" si el correo salió.
export default function Reenviar({ contactId, nombre, t }: { contactId: string; nombre: string; t: TextosContactos["lista"] }) {
  const [estado, accion, enviando] = useActionState<EstadoReenviar, FormData>(reenviarInvitacion, {});
  return (
    <form action={accion}>
      <input type="hidden" name="contact_id" value={contactId} />
      <button type="submit" disabled={enviando} className={clases.enlace} aria-label={`${t.reenviar} a ${nombre}`}>
        {enviando ? t.reenviando : t.reenviar}
      </button>
      <p role="status" className="text-sm">
        {estado.ok ? t.reenviada : estado.error ? <span className="text-danger">{estado.error}</span> : null}
      </p>
    </form>
  );
}
