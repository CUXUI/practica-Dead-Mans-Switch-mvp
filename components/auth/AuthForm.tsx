"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = { mode: "login" | "registro" };

const inputClass =
  "w-full min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-text focus:outline-2 focus:outline-brand-primary";

export default function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const supabase = createClient();

    if (mode === "login") {
      // Acepta correo o usuario: si es usuario, se resuelve el correo de esa cuenta.
      const identifier = String(form.get("identifier") ?? "").trim();
      const { data: resolved } = await supabase.rpc("resolve_login_email", { identifier });
      if (!resolved) {
        setLoading(false);
        return setError("No pudimos iniciar sesión. Revisá tu correo o usuario y contraseña.");
      }
      const { error } = await supabase.auth.signInWithPassword({ email: resolved, password });
      setLoading(false);
      if (error) return setError("No pudimos iniciar sesión. Revisá tu correo o usuario y contraseña.");
      router.push("/home");
      router.refresh();
      return;
    }

    // Registro (E0): nombre, teléfono, mayor de 18 y aviso de que no reemplaza a emergencias
    const fullName = String(form.get("full_name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const username = String(form.get("username") ?? "").trim().toLowerCase();
    const isAdult = form.get("is_adult") === "on";
    const ackEmergency = form.get("ack_emergency") === "on";

    if (!/^[a-z0-9._]{3,20}$/.test(username)) {
      setLoading(false);
      return setError("El usuario tiene que tener de 3 a 20 caracteres: letras, números, punto o guion bajo.");
    }

    if (!isAdult || !ackEmergency) {
      setLoading(false);
      return setError("Para continuar tenés que confirmar las dos casillas.");
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, username, is_adult: true },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) return setError("No pudimos crear la cuenta. Probá con otro correo o contraseña.");

    if (data.session) {
      router.push("/home");
      router.refresh();
    } else {
      setInfo("Te enviamos un correo para confirmar tu cuenta. Revisá también la carpeta de spam.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
      {mode === "registro" && (
        <>
          <div>
            <label htmlFor="full_name" className="mb-1 block text-sm font-medium">Nombre</label>
            <input id="full_name" name="full_name" required autoComplete="name" className={inputClass} />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium">Teléfono</label>
            <input id="phone" name="phone" type="tel" required autoComplete="tel" className={inputClass} />
          </div>
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium">Usuario</label>
            <input
              id="username"
              name="username"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9._]{3,20}"
              autoComplete="username"
              className={inputClass}
            />
          </div>
        </>
      )}

      {mode === "login" ? (
        <div>
          <label htmlFor="identifier" className="mb-1 block text-sm font-medium">Correo o usuario</label>
          <input id="identifier" name="identifier" required autoComplete="username" className={inputClass} />
        </div>
      ) : (
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Correo</label>
          <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
        </div>
      )}
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className={inputClass}
        />
      </div>

      {mode === "registro" && (
        <div className="space-y-3 text-sm">
          <label className="flex items-start gap-3">
            <input type="checkbox" name="is_adult" className="mt-1 size-5" />
            <span>Confirmo que soy mayor de 18 años.</span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" name="ack_emergency" className="mt-1 size-5" />
            <span>Entiendo que esta app no reemplaza a los servicios de emergencia.</span>
          </label>
        </div>
      )}

      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      {info && <p role="status" className="text-sm text-success">{info}</p>}

      <button
        type="submit"
        disabled={loading}
        className="min-h-11 w-full rounded-lg bg-brand-primary px-4 py-2 font-medium text-brand-on-primary disabled:opacity-60"
      >
        {loading ? "Un momento…" : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
      </button>
    </form>
  );
}
