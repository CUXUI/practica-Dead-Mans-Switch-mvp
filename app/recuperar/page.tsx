"use client";

import { useState } from "react";
import Link from "next/link";

const inputClass =
  "w-full min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-text focus:outline-2 focus:outline-brand-primary";

// Olvidé mi contraseña: envía un enlace al correo. La respuesta es la misma exista o no la cuenta,
// para no revelar qué correos están registrados.
export default function RecuperarPage() {
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    try {
      const res = await fetch("/api/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("respuesta");
      setEnviado(true);
    } catch {
      setError("No pudimos enviar el correo. Revisa tu conexión e inténtalo otra vez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Recuperar contraseña</h1>
      {enviado ? (
        <p role="status" className="text-text-muted">
          Si el correo está registrado, te enviamos un enlace para cambiar la contraseña. Revisa también la carpeta de spam.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <p className="text-text-muted">Escribe el correo de tu cuenta y te enviamos un enlace.</p>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">Correo</label>
            <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
          </div>
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="min-h-11 w-full rounded-lg bg-brand-primary px-4 py-2 font-medium text-brand-on-primary disabled:opacity-60"
          >
            {loading ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>
      )}
      <p className="text-sm">
        <Link href="/login" className="font-medium text-brand-primary underline">Volver a iniciar sesión</Link>
      </p>
    </main>
  );
}
