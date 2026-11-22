"use client";

import { useState } from "react";
import { Aviso, Boton, Caja, Desplegable, Marco } from "./ui";
import type { Variant } from "@/lib/brand";
import { textosInvitacion } from "./textos";
import { useInvitationFlow } from "./useInvitationFlow";
import type { ContactsApi } from "./types";

// Flujo "Aceptar ser contacto" (R1): según el estado de la invitación muestra una pantalla.
// Quien recibe no tiene cuenta ni instala nada: todo se hace desde el enlace con token.
export default function AceptarContacto({
  token,
  marca,
  variant,
  api,
}: {
  token: string;
  marca: string; // nombre de la marca
  variant: Variant;
  api?: ContactsApi;
}) {
  const textos = textosInvitacion(variant, marca);
  const [duda, setDuda] = useState<number | null>(null); // una duda abierta a la vez
  const { state, respond, retry } = useInvitationFlow(token, api);

  switch (state.step) {
    case "loading":
      return (
        <main role="status" aria-live="polite" className="mx-auto max-w-md space-y-4 p-6">
          <p className="font-bold">{marca}</p>
          <div className="h-9 w-4/5 rounded-lg bg-surface" />
          <div className="h-4 rounded-lg bg-surface" />
          <div className="h-4 rounded-lg bg-surface" />
          <span className="sr-only">{textos.cargando}</span>
        </main>
      );

    case "loadError":
      return (
        <Marco
          marca={marca}
          titulo={textos.errorCarga.titulo}
          acciones={<Boton onClick={retry}>{textos.errorCarga.reintentar}</Boton>}
        >
          <p className="text-text-muted">{textos.errorCarga.cuerpo}</p>
        </Marco>
      );

    case "inactive":
      return (
        <Marco marca={marca} titulo={textos.inactiva.titulo}>
          <Caja>
            <p>{textos.inactiva.cuerpo}</p>
          </Caja>
        </Marco>
      );

    case "already":
      return (
        <Marco marca={marca} titulo={textos.yaEsContacto.titulo(state.invitation.issuerName)}>
          <p className="text-text-muted">{textos.yaEsContacto.cuerpo}</p>
        </Marco>
      );

    case "accepted": {
      const emisor = state.invitation.issuerName;
      return (
        <Marco marca={marca} titulo={textos.acepto.titulo(emisor)}>
          {textos.acepto.cuerpo(emisor).map((linea) => (
            <p key={linea} className="text-text-muted">
              {linea}
            </p>
          ))}
          <p className="text-text-muted">{textos.acepto.correo(state.invitation.contactEmail)}</p>
          <Aviso>{textos.acepto.emisorAvisado(emisor)}</Aviso>
        </Marco>
      );
    }

    case "rejected": {
      const emisor = state.invitation.issuerName;
      return (
        <Marco marca={marca} titulo={textos.rechazo.titulo(emisor)}>
          <p className="text-text-muted">{textos.rechazo.cuerpo(emisor)}</p>
        </Marco>
      );
    }

    case "invitation": {
      const emisor = state.invitation.issuerName;
      const ocupado = state.submitting !== null;
      const t = textos.invitacion;
      return (
        <Marco
          marca={marca}
          titulo={t.titulo(emisor)}
          acciones={
            <>
              {state.error && <Aviso tono="error">{t.errorEnvio}</Aviso>}
              <Boton disabled={ocupado} onClick={() => respond("accept")}>
                {state.submitting === "accept" ? t.enviando : t.aceptar}
              </Boton>
              <Boton variante="secundario" disabled={ocupado} onClick={() => respond("reject")}>
                {state.submitting === "reject" ? t.enviando : t.rechazar}
              </Boton>
              <p className="text-sm text-text-muted">{t.aclaracion}</p>
            </>
          }
        >
          <p className="text-text-muted">{t.intro(emisor)}</p>
          <Caja titulo={t.implicaTitulo}>
            <ul className="list-disc space-y-2 pl-5">
              {t.implica(emisor).map((linea) => (
                <li key={linea}>{linea}</li>
              ))}
            </ul>
            <p className="text-sm text-text-muted">{t.notaSinConfirmar}</p>
          </Caja>
          <h2 className="text-lg font-semibold">{t.dudasTitulo}</h2>
          {t.dudas(emisor).map((d, i) => (
            <Desplegable
              key={d.pregunta}
              id={`duda-${i}`}
              resumen={d.pregunta}
              abierto={duda === i}
              onToggle={() => setDuda(duda === i ? null : i)}
            >
              {d.respuesta}
            </Desplegable>
          ))}
        </Marco>
      );
    }
  }
}
