"use client";

import { useActionState, useEffect, useState } from "react";
import Toast from "@/components/emisor/Toast";
import { reenviarInvitacion, type EstadoReenviar } from "@/app/contactos/actions";
import { clases } from "@/components/emisor/ui";
import Spinner from "@/components/emisor/Spinner";
import type { TextosContactos } from "./textos";

// E5 · Reenviar (decidido el 2/11). Solo dice "reenviada" si el correo salió.
// sinEnviar: la invitación nunca salió, así que el botón dice "Enviar", no "Reenviar".
export default function Reenviar({
  contactId,
  nombre,
  sinEnviar,
  t,
  comoBoton = false,
}: {
  contactId: string;
  nombre: string;
  sinEnviar: boolean;
  t: TextosContactos["lista"];
  // En el detalle (E-16) es un botón con borde; en la lista, un enlace.
  comoBoton?: boolean;
}) {
  const [estado, accion, enviando] = useActionState<EstadoReenviar, FormData>(reenviarInvitacion, {});
  // Cada respuesta nueva vuelve a sacar el toast, aunque pulses dos veces.
  const [envios, setEnvios] = useState(0);
  useEffect(() => {
    if (estado.ok) setEnvios((n) => n + 1);
  }, [estado]);
  const etiqueta = sinEnviar ? t.enviarAhora : t.reenviar;

  return (
    <form action={accion}>
      <input type="hidden" name="contact_id" value={contactId} />
      <button type="submit" disabled={enviando} className={comoBoton ? clases.principal : clases.enlace} aria-label={`${etiqueta} a ${nombre}`}>
        {enviando ? (<span className="inline-flex items-center gap-2"><Spinner className="size-4" />{t.reenviando}</span>) : etiqueta}
      </button>
      {/* Éxito: toast temporal. Error: texto fijo, porque pide una acción. */}
      {estado.ok && envios > 0 && <Toast key={envios} texto={sinEnviar ? t.enviada : t.reenviada} />}
      {estado.error && (
        <p role="alert" className="text-sm text-danger">
          {estado.error}
        </p>
      )}
    </form>
  );
}
