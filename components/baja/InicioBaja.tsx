"use client";

import { useState, type FormEvent } from "react";
import { BotonBaja, MarcoBaja } from "./ui";
import { textosBaja } from "./textos";

const t = textosBaja;

// Entrada directa a la baja (por ejemplo desde la landing): se pide el correo y se envía un enlace, sin código.
// La respuesta no revela si el correo es de un contacto o no.
export default function InicioBaja({ marca }: { marca: string }) {
  const [email, setEmail] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOcupado(true);
    setError("");
    try {
      const response = await fetch("/api/baja/iniciar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { kind: string };
      if (data.kind === "ok") return setEnviado(true);
      if (data.kind === "invalid_email") return setError(t.inicio.correoInvalido);
      setError(t.inicio.errorEnvio);
    } catch {
      setError(t.inicio.errorEnvio);
    } finally {
      setOcupado(false);
    }
  }

  if (enviado) {
    return (
      <MarcoBaja
        marca={marca}
        titulo={t.enviado.titulo}
        acciones={<BotonBaja variante="secundario" onClick={() => setEnviado(false)}>{t.enviado.otroCorreo}</BotonBaja>}
      >
        <p role="status">{t.enviado.cuerpo(email.trim())}</p>
        <p className="text-sm text-text-muted">{t.enviado.ayuda}</p>
      </MarcoBaja>
    );
  }

  return (
    <MarcoBaja
      marca={marca}
      titulo={t.inicio.titulo}
      acciones={<BotonBaja type="submit" form="formulario-inicio-baja" disabled={ocupado}>{ocupado ? t.inicio.enviando : t.inicio.boton}</BotonBaja>}
    >
      <p>{t.inicio.cuerpo}</p>
      <form id="formulario-inicio-baja" onSubmit={enviar} noValidate>
        <label htmlFor="correo-contacto" className="sr-only">{t.inicio.campo}</label>
        <input
          id="correo-contacto"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(event) => { setEmail(event.target.value); setError(""); }}
          aria-invalid={!!error}
          aria-describedby={error ? "error-correo-contacto" : undefined}
          placeholder={t.inicio.placeholder}
          className="min-h-12 w-full rounded-xl border border-border bg-surface px-4 aria-[invalid=true]:border-danger"
        />
        {error && <p id="error-correo-contacto" role="alert" className="mt-2 text-sm text-danger">ⓘ {error}</p>}
      </form>
    </MarcoBaja>
  );
}
