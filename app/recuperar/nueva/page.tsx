"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-text focus:outline-2 focus:outline-brand-primary";

// Llega desde el enlace del correo, con la sesión de recuperación ya iniciada por el callback.
export default function NuevaContrasenaPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    const repetir = String(form.get("repetir") ?? "");
    if (password.length < 8) return setError("La contraseña tiene que tener al menos 8 caracteres.");
    if (password !== repetir) return setError("Las contraseñas no coinciden.");

    setLoading(true);
    const supabase = createClient();
    const { error: errorCambio } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (errorCambio) return setError("No pudimos cambiar la contraseña. Pide un enlace nuevo e inténtalo otra vez.");
    router.replace("/home");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Nueva contraseña</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">Nueva contraseña</label>
          <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
        </div>
        <div>
          <label htmlFor="repetir" className="mb-1 block text-sm font-medium">Repite la contraseña</label>
          <input id="repetir" name="repetir" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
        </div>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="min-h-11 w-full rounded-lg bg-brand-primary px-4 py-2 font-medium text-brand-on-primary disabled:opacity-60"
        >
          {loading ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>
    </main>
  );
}
