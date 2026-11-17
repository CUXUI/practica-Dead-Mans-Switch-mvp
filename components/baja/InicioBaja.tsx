"use client";

import { useState, type FormEvent } from "react";
import { BotonBaja, MarcoBaja } from "./ui";

export default function InicioBaja({ marca }: { marca: string }) {
  const [email, setEmail] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");

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
      const data = (await response.json()) as { kind: string; token?: string };
      if (data.kind === "ok" && data.token) {
        window.location.assign(`/baja/${encodeURIComponent(data.token)}#paso=codigo`);
        return;
      }
      if (data.kind === "invalid_email") return setError("Escribe un correo válido.");
      if (data.kind === "not_found") return setError("No encontramos un contacto activo con ese correo.");
      if (data.kind === "multiple") return setError("Ese correo corresponde a más de un contacto. Usa el enlace recibido en una alerta.");
      if (data.kind === "wait") return setError("Espera unos segundos antes de solicitar otro código.");
      setError("No pudimos enviar el código. Inténtalo otra vez.");
    } catch {
      setError("No pudimos enviar el código. Revisa tu conexión e inténtalo otra vez.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <MarcoBaja
      marca={marca}
      etiqueta="Propuesta"
      titulo="¿Quieres dejar de ser contacto de alguien?"
      acciones={<BotonBaja type="submit" form="formulario-inicio-baja" disabled={ocupado}>{ocupado ? "Enviando…" : "Enviar código"}</BotonBaja>}
    >
      <p>Escribe tu correo.</p>
      <form id="formulario-inicio-baja" onSubmit={enviar} noValidate>
        <label htmlFor="correo-contacto" className="sr-only">Tu correo</label>
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
          placeholder="tu correo"
          className="min-h-12 w-full rounded-xl border border-border bg-surface px-4 aria-[invalid=true]:border-danger"
        />
        {error && <p id="error-correo-contacto" role="alert" className="mt-2 text-sm text-danger">ⓘ {error}</p>}
      </form>
    </MarcoBaja>
  );
}
