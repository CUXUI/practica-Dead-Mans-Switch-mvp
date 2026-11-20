"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { TextosAlta } from "@/components/alta/textos";
// Escucha desde ya el aviso de instalación de Android (se dispara una vez por página).
import { detectarPlataforma } from "@/components/alta/instalacion";
import { IconoAlerta, IconoCargando, IconoOjo, IconoOjoTachado, IconoReintentar } from "@/components/alta/iconos";

// E0 · Registro de quien emite. Estados de los wireframes: vacío, con errores,
// correo ya registrado, cargando y sin conexión.

// Adónde va la persona al crear la cuenta: la guía para agregar la app a inicio.
const DESTINO_TRAS_REGISTRO = "/alta/instalar";

type Campo = "full_name" | "email" | "phone" | "username" | "password" | "is_adult" | "ack_emergency";
type Errores = Partial<Record<Campo, string>>;
type Aviso = "correo-registrado" | "sin-conexion" | "error-general" | null;

const ORDEN: Campo[] = ["full_name", "email", "phone", "username", "password", "is_adult", "ack_emergency"];

const inputBase =
  "w-full min-h-12 rounded-lg border bg-surface px-3 py-2 text-text placeholder:text-text-muted focus:outline-2 focus:outline-offset-1 focus:outline-brand-primary disabled:bg-surface-muted";

function esErrorDeRed(mensaje: string | undefined) {
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  return !!mensaje && /fetch|network|conexi/i.test(mensaje);
}

export default function RegistroForm({ textos }: { textos: TextosAlta["registro"] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [errores, setErrores] = useState<Errores>({});
  const [aviso, setAviso] = useState<Aviso>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [verContrasena, setVerContrasena] = useState(false);

  function validar(form: FormData): Errores {
    const e: Errores = {};
    const nombre = String(form.get("full_name") ?? "").trim();
    const correo = String(form.get("email") ?? "").trim();
    const celular = String(form.get("phone") ?? "").replace(/[\s()-]/g, "");
    const usuario = String(form.get("username") ?? "").trim().toLowerCase();
    const contrasena = String(form.get("password") ?? "");
    if (nombre.length < 2) e.full_name = textos.revisaCampo;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) e.email = textos.revisaCampo;
    if (!/^\+?\d{7,15}$/.test(celular)) e.phone = textos.revisaCampo;
    if (!/^[a-z0-9._]{3,20}$/.test(usuario)) e.username = textos.revisaCampo;
    if (contrasena.length < 8) e.password = textos.revisaCampo;
    if (form.get("is_adult") !== "on") e.is_adult = textos.revisaOpcion;
    if (form.get("ack_emergency") !== "on") e.ack_emergency = textos.revisaOpcion;
    return e;
  }

  function enfocarPrimerError(e: Errores) {
    const primero = ORDEN.find((c) => e[c]);
    if (primero) formRef.current?.querySelector<HTMLInputElement>(`[name="${primero}"]`)?.focus();
  }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setAviso(null);
    setInfo(null);

    const form = new FormData(ev.currentTarget);
    const e = validar(form);
    setErrores(e);
    if (Object.keys(e).length > 0) return enfocarPrimerError(e);

    if (!navigator.onLine) return setAviso("sin-conexion");

    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));
    const fullName = String(form.get("full_name")).trim();
    const phone = String(form.get("phone")).trim();
    const username = String(form.get("username")).trim().toLowerCase();

    setCargando(true);
    const supabase = createClient();

    // El usuario tiene que ser único: si ya resuelve a un correo, está en uso.
    const { data: enUso, error: errorUsuario } = await supabase.rpc("resolve_login_email", {
      identifier: username,
    });
    if (errorUsuario) {
      setCargando(false);
      return setAviso(esErrorDeRed(errorUsuario.message) ? "sin-conexion" : "error-general");
    }
    if (enUso) {
      setCargando(false);
      const conError = { username: textos.usuarioEnUso };
      setErrores(conError);
      return enfocarPrimerError(conError);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, username, is_adult: true, plataforma: detectarPlataforma() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    const correoRepetido =
      error?.code === "user_already_exists" ||
      /already registered/i.test(error?.message ?? "") ||
      (!error && data.user && data.user.identities?.length === 0);

    if (correoRepetido) {
      setCargando(false);
      setErrores({ email: textos.correoRegistradoCampo });
      return setAviso("correo-registrado");
    }
    if (error) {
      setCargando(false);
      return setAviso(esErrorDeRed(error.message) ? "sin-conexion" : "error-general");
    }

    if (data.session) {
      router.push(DESTINO_TRAS_REGISTRO);
      router.refresh();
      return;
    }
    setCargando(false);
    setInfo(textos.confirmaTuCorreo);
  }

  function MensajeError({ campo }: { campo: Campo }) {
    if (!errores[campo]) return null;
    return (
      <p id={`${campo}-error`} className="mt-1 flex items-center gap-1 text-sm text-danger">
        <IconoAlerta className="size-4 shrink-0" />
        {errores[campo]}
      </p>
    );
  }

  function campoTexto(
    campo: "full_name" | "email" | "phone" | "username",
    etiqueta: string,
    ejemplo: string,
    extra: React.InputHTMLAttributes<HTMLInputElement>,
    ayuda?: string,
  ) {
    const describedBy = [errores[campo] && `${campo}-error`, ayuda && `${campo}-ayuda`].filter(Boolean).join(" ");
    return (
      <div>
        <label htmlFor={campo} className="mb-1 block text-sm font-semibold">
          {etiqueta}
        </label>
        <input
          id={campo}
          name={campo}
          placeholder={ejemplo}
          disabled={cargando}
          aria-invalid={!!errores[campo]}
          aria-describedby={describedBy || undefined}
          className={`${inputBase} ${errores[campo] ? "border-danger" : "border-border"}`}
          {...extra}
        />
        {ayuda && !errores[campo] && (
          <p id={`${campo}-ayuda`} className="mt-1 text-sm text-text-muted">
            {ayuda}
          </p>
        )}
        <MensajeError campo={campo} />
      </div>
    );
  }

  function casilla(campo: "is_adult" | "ack_emergency", texto: string) {
    return (
      <div>
        <label className="flex min-h-11 items-start gap-3 text-base">
          <input
            type="checkbox"
            name={campo}
            disabled={cargando}
            aria-invalid={!!errores[campo]}
            aria-describedby={errores[campo] ? `${campo}-error` : undefined}
            className="mt-0.5 size-6 shrink-0 accent-brand-primary"
          />
          <span>{texto}</span>
        </label>
        <div className="pl-9">
          <MensajeError campo={campo} />
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={cargando} className="space-y-4">
      {aviso && (
        <div role="alert" className="rounded-lg bg-fondo-sutil p-4">
          <p className="flex items-center gap-2 font-semibold">
            <IconoAlerta className="size-5 shrink-0" />
            {aviso === "correo-registrado"
              ? textos.correoRegistradoTitulo
              : aviso === "sin-conexion"
                ? textos.sinConexionTitulo
                : textos.errorGeneralTitulo}
          </p>
          <p className="mt-1 pl-7 text-sm text-text-muted">
            {aviso === "correo-registrado"
              ? textos.correoRegistradoCuerpo
              : aviso === "sin-conexion"
                ? textos.sinConexionCuerpo
                : textos.errorGeneralCuerpo}
          </p>
          {aviso === "correo-registrado" && (
            <Link href="/login" className="mt-3 ml-7 inline-flex min-h-11 items-center font-semibold underline">
              {textos.iniciarSesion}
            </Link>
          )}
          {aviso === "sin-conexion" && (
            <button
              type="button"
              onClick={() => formRef.current?.requestSubmit()}
              className="mt-3 ml-7 inline-flex min-h-11 items-center gap-2 font-semibold underline"
            >
              <IconoReintentar className="size-5" />
              {textos.reintentar}
            </button>
          )}
        </div>
      )}

      {campoTexto("full_name", textos.nombre, textos.nombreEjemplo, { autoComplete: "name" })}
      {campoTexto("email", textos.correo, textos.correoEjemplo, {
        type: "email",
        autoComplete: "email",
        inputMode: "email",
      })}
      {campoTexto("phone", textos.celular, textos.celularEjemplo, {
        type: "tel",
        autoComplete: "tel",
        inputMode: "tel",
      })}
      {campoTexto(
        "username",
        textos.usuario,
        textos.usuarioEjemplo,
        { autoComplete: "username", autoCapitalize: "none", maxLength: 20 },
        textos.usuarioAyuda,
      )}

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-semibold">
          {textos.contrasena}
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={verContrasena ? "text" : "password"}
            placeholder={textos.contrasenaEjemplo}
            autoComplete="new-password"
            disabled={cargando}
            aria-invalid={!!errores.password}
            aria-describedby={errores.password ? "password-error" : "password-ayuda"}
            className={`${inputBase} pr-12 ${errores.password ? "border-danger" : "border-border"}`}
          />
          <button
            type="button"
            onClick={() => setVerContrasena((v) => !v)}
            aria-label={verContrasena ? textos.ocultarContrasena : textos.mostrarContrasena}
            aria-pressed={verContrasena}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-text"
          >
            {verContrasena ? <IconoOjoTachado className="size-5" /> : <IconoOjo className="size-5" />}
          </button>
        </div>
        {!errores.password && (
          <p id="password-ayuda" className="mt-1 text-sm text-text-muted">
            {textos.contrasenaAyuda}
          </p>
        )}
        <MensajeError campo="password" />
      </div>

      {casilla("is_adult", textos.mayorDeEdad)}
      {casilla("ack_emergency", textos.noReemplazaEmergencias)}

      {info && (
        <p role="status" className="text-sm text-success">
          {info}
        </p>
      )}

      <button
        type="submit"
        disabled={cargando}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2 font-semibold text-brand-on-primary disabled:opacity-70"
      >
        {cargando ? (
          <>
            {textos.cargando}
            <IconoCargando className="size-5" />
          </>
        ) : (
          textos.boton
        )}
      </button>
    </form>
  );
}
