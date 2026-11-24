"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { invitarContacto, type EstadoInvitar } from "@/app/contactos/actions";
import { Segmentado } from "@/components/aviso/ConfigurarAviso";
import Spinner from "@/components/emisor/Spinner";
import { BarraTitulo, Pantalla, Progreso, Tarjeta, clases } from "@/components/emisor/ui";
import type { TextosContactos } from "./textos";

// R-AV-E1 · Web · Aviso · establecer contacto (alta: solo nombre y correo) y
// E-06 · Agregar contacto (fuera del alta: además relación y mensaje de invitación).
export default function FormContacto({
  t,
  enAlta,
  esPrimero,
  cancelarHref,
  mensajeMax = 300,
}: {
  t: TextosContactos["nuevo"];
  enAlta: boolean;
  esPrimero: boolean;
  cancelarHref: string;
  mensajeMax?: number;
}) {
  const [estado, accion, enviando] = useActionState<EstadoInvitar, FormData>(invitarContacto, {});
  const [modo, setModo] = useState<"general" | "personalizado">("general");
  // Tras cada respuesta del servidor el formulario se reinicia y los botones de opción pierden la marca:
  // se vuelven a montar con el valor elegido.
  const [vuelta, setVuelta] = useState(0);
  useEffect(() => setVuelta((n) => n + 1), [estado]);
  // Contador del mensaje: arranca con lo que volvió del servidor y se actualiza al escribir.
  const [largoMensaje, setLargoMensaje] = useState((estado.valores?.mensaje ?? "").length);
  useEffect(() => setLargoMensaje((estado.valores?.mensaje ?? "").length), [estado]);
  const errNombre = estado.campo === "name" ? estado.error : undefined;
  const errCorreo = estado.campo === "email" ? estado.error : undefined;
  const errMensaje = estado.campo === "mensaje" ? estado.error : undefined;
  const errGeneral = estado.error && !estado.campo ? estado.error : undefined;

  return (
    <form action={accion} noValidate>
      <Pantalla
        pie={
          <>
            <button type="submit" disabled={enviando} className={clases.principal}>
              {enviando ? (<span className="inline-flex items-center gap-2"><Spinner />{t.enviando}</span>) : t.enviar}
            </button>
            {/* Fuera del alta ya hay flecha de volver arriba. */}
            {enAlta && (
              <Link href={cancelarHref} className={clases.secundario}>
                {t.cancelar}
              </Link>
            )}
          </>
        }
      >
        {enAlta ? (
          <>
            <Progreso actual={2} total={3} siguiente={t.siguiente} />
            <h1 className="text-tarjeta">{t.titulo}</h1>
            <p className="text-text-muted">{t.texto}</p>
          </>
        ) : (
          <BarraTitulo titulo={t.tituloFuera} volverHref={cancelarHref} />
        )}
        {errGeneral && (
          <p role="alert" className="rounded-lg border-2 border-danger bg-surface p-3 text-sm font-medium">
            {errGeneral}
          </p>
        )}
        <Tarjeta titulo={enAlta ? (esPrimero ? t.tarjetaPrimero : t.tarjetaOtro) : undefined} id="tarjeta-contacto">
          <div>
            <label htmlFor="name" className={clases.etiqueta}>
              {t.nombre}
            </label>
            <input
              id="name"
              name="name"
              autoComplete="off"
              required
              maxLength={80}
              placeholder={t.nombreEjemplo}
              defaultValue={estado.valores?.name}
              aria-invalid={!!errNombre}
              aria-describedby={errNombre ? "name-error" : "name-ayuda"}
              className={clases.campo}
            />
            {errNombre ? (
              <p id="name-error" className={clases.error}>
                {errNombre}
              </p>
            ) : (
              <p id="name-ayuda" className={clases.ayuda}>
                {t.nombreAyuda}
              </p>
            )}
          </div>
          {(
            <div>
              <label htmlFor="relacion" className={clases.etiqueta}>
                {t.relacion} <span className="font-normal text-text-muted">{t.opcional}</span>
              </label>
              <input
                id="relacion"
                name="relacion"
                autoComplete="off"
                maxLength={40}
                placeholder={t.relacionEjemplo}
                defaultValue={estado.valores?.relacion}
                aria-describedby="relacion-ayuda"
                className={clases.campo}
              />
              <p id="relacion-ayuda" className={clases.ayuda}>
                {t.relacionAyuda}
              </p>
            </div>
          )}
          <div>
            <label htmlFor="email" className={clases.etiqueta}>
              {t.correo}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="off"
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
        </Tarjeta>
        {/* El mensaje de invitación va también en el alta (decisión de Mariola, 14/11). */}
        {(
          <Tarjeta>
            <fieldset key={vuelta} className="space-y-3">
              <legend className="mb-3 font-semibold">{t.mensaje}</legend>
              <Segmentado
                name="modo"
                valor={modo}
                onChange={(v) => setModo(v as "general" | "personalizado")}
                opciones={[
                  { valor: "general", label: t.general },
                  { valor: "personalizado", label: t.personalizado },
                ]}
              />
              {modo === "general" ? (
                <p className="text-sm text-text-muted">{t.generalAyuda}</p>
              ) : (
                <div>
                  <label htmlFor="mensaje" className={clases.etiqueta}>
                    {t.tuMensaje}
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows={3}
                    maxLength={mensajeMax}
                    defaultValue={estado.valores?.mensaje}
                    onChange={(e) => setLargoMensaje(e.target.value.length)}
                    aria-invalid={!!errMensaje}
                    aria-describedby={errMensaje ? "mensaje-error" : "mensaje-ayuda mensaje-contador"}
                    className={`${clases.campo} resize-none`}
                  />
                  {errMensaje ? (
                    <p id="mensaje-error" className={clases.error}>
                      {errMensaje}
                    </p>
                  ) : (
                    <p id="mensaje-ayuda" className={clases.ayuda}>
                      {t.tuMensajeAyuda}
                    </p>
                  )}
                  <p id="mensaje-contador" className="mt-1 text-right text-sm text-text-muted">
                    <span aria-hidden="true">
                      {largoMensaje} / {mensajeMax}
                    </span>
                    <span className="sr-only">
                      {largoMensaje} de {mensajeMax} caracteres
                    </span>
                  </p>
                </div>
              )}
            </fieldset>
          </Tarjeta>
        )}
      </Pantalla>
    </form>
  );
}
