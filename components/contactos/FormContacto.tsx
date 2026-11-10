"use client";

import { useActionState } from "react";
import Link from "next/link";
import { invitarContacto, type EstadoInvitar } from "@/app/contactos/actions";
import { Pantalla, Progreso, Tarjeta, clases } from "@/components/emisor/ui";
import type { TextosContactos } from "./textos";

// R-AV-E1 · Web · Aviso · establecer contacto
export default function FormContacto({
  t,
  enAlta,
  esPrimero,
  cancelarHref,
}: {
  t: TextosContactos["nuevo"];
  enAlta: boolean;
  esPrimero: boolean;
  cancelarHref: string;
}) {
  const [estado, accion, enviando] = useActionState<EstadoInvitar, FormData>(invitarContacto, {});
  const errNombre = estado.campo === "name" ? estado.error : undefined;
  const errCorreo = estado.campo === "email" ? estado.error : undefined;
  const errGeneral = estado.error && !estado.campo ? estado.error : undefined;

  return (
    <form action={accion} noValidate>
      <Pantalla
        pie={
          <>
            <button type="submit" disabled={enviando} className={clases.principal}>
              {enviando ? t.enviando : t.enviar}
            </button>
            <Link href={cancelarHref} className={clases.secundario}>
              {t.cancelar}
            </Link>
          </>
        }
      >
        {enAlta && <Progreso actual={2} total={3} siguiente={t.siguiente} />}
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{t.titulo}</h1>
          <p className="text-text-muted">{t.texto}</p>
        </div>
        <Tarjeta titulo={esPrimero ? t.tarjetaPrimero : t.tarjetaOtro} id="tarjeta-contacto">
          <div>
            <label htmlFor="name" className={clases.etiqueta}>
              {t.nombre}
            </label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              required
              maxLength={80}
              placeholder={t.nombreEjemplo}
              defaultValue={estado.valores?.name}
              aria-invalid={!!errNombre}
              aria-describedby={errNombre ? "name-error" : undefined}
              className={clases.campo}
            />
            {errNombre && (
              <p id="name-error" className={clases.error}>
                {errNombre}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="email" className={clases.etiqueta}>
              {t.correo}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              placeholder={t.correoEjemplo}
              defaultValue={estado.valores?.email}
              aria-invalid={!!errCorreo}
              aria-describedby={errCorreo ? "email-error" : "email-ayuda"}
              className={clases.campo}
            />
            {errCorreo ? (
              <p id="email-error" className={clases.error}>
                {errCorreo}
              </p>
            ) : (
              <p id="email-ayuda" className={clases.ayuda}>
                {t.correoAyuda}
              </p>
            )}
          </div>
          {errGeneral && (
            <p role="alert" className={clases.error}>
              {errGeneral}
            </p>
          )}
        </Tarjeta>
      </Pantalla>
    </form>
  );
}
