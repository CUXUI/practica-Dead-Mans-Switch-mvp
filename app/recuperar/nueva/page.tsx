"use client";

import { boton as botonDS, campo as campoDS } from "@/components/ds/estilos";
import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  campoDS.control;

// Llega desde el enlace del correo: /recuperar/nueva?token=… El servidor valida el token y cambia la contraseña.
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

    const token = new URLSearchParams(window.location.search).get("token") ?? "";
    setLoading(true);
    const res = await fetch("/api/recuperar/confirmar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    }).catch(() => null);
    const json = res ? ((await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null) : null;
    setLoading(false);
    if (!res || !res.ok || !json?.ok) {
      return setError(json?.error ?? "No pudimos cambiar la contraseña. Pide un enlace nuevo e inténtalo otra vez.");
    }
    router.replace("/login?cambio=ok");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-seccion">Nueva contraseña</h1>
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
          className={`${botonDS.principal}`}
        >
          {loading ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>
    </main>
  );
}
