"use client";

import { useActionState } from "react";
import { guardarContacto, type EstadoEditar } from "@/app/contactos/actions";
import { rellenar } from "@/components/aviso/textos";
import Spinner from "@/components/emisor/Spinner";
import { BarraTitulo, Pantalla, Tarjeta, clases } from "@/components/emisor/ui";
import type { TextosContactos } from "./textos";

// E-17 · Editar contacto. Versión simple: se llega desde "Editar" en la lista, sin pantalla de Detalle.
// Cambiar el correo es "reemplazar": la persona tiene que aceptar otra vez.
export default function EditarContacto({
  t,
  tNuevo,
  contacto,
  apagaAviso,
  acepto,
}: {
  t: TextosContactos["editar"];
  tNuevo: TextosContactos["nuevo"];
  contacto: { id: string; name: string; email: string; relacion: string; primerNombre: string };
  // Es la única persona que aceptó en un aviso encendido: si cambia su correo, el aviso se apaga.
  apagaAviso: boolean;
  acepto: boolean;
}) {
  const [estado, accion, enviando] = useActionState<EstadoEditar, FormData>(guardarContacto, {});
  const errNombre = estado.campo === "name" ? estado.error : undefined;
  const errCorreo = estado.campo === "email" ? estado.error : undefined;
  const errGeneral = estado.error && !estado.campo ? estado.error : undefined;
  const v = estado.valores ?? { name: contacto.name, email: contacto.email, relacion: contacto.relacion };

  return (
    <form action={accion} noValidate>
      <input type="hidden" name="contact_id" value={contacto.id} />
      <Pantalla
        pie={
          <button type="submit" disabled={enviando} className={clases.principal}>
            {enviando ? (<span className="inline-flex items-center gap-2"><Spinner />{t.guardando}</span>) : t.guardar}
          </button>
        }
      >
        <BarraTitulo titulo={t.titulo} volverHref={`/contactos/${contacto.id}`} />
        {errGeneral && (
          <p role="alert" className="rounded-lg border-2 border-danger bg-surface p-3 text-sm font-medium">
            {errGeneral}
          </p>
        )}
        <Tarjeta>
          <div>
            <label htmlFor="name" className={clases.etiqueta}>
              {tNuevo.nombre}
            </label>
            <input
              id="name"
              name="name"
              autoComplete="off"
              required
              maxLength={80}
              defaultValue={v.name}
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
            <label htmlFor="relacion" className={clases.etiqueta}>
              {tNuevo.relacion} <span className="font-normal text-text-muted">{tNuevo.opcional}</span>
            </label>
            <input
              id="relacion"
              name="relacion"
              autoComplete="off"
              maxLength={40}
              placeholder={tNuevo.relacionEjemplo}
              defaultValue={v.relacion}
              className={clases.campo}
            />
          </div>
          <div>
            <label htmlFor="email" className={clases.etiqueta}>
              {tNuevo.correo}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="off"
              required
              defaultValue={v.email}
              aria-invalid={!!errCorreo}
              aria-describedby={errCorreo ? "email-error email-ayuda" : "email-ayuda"}
              className={clases.campo}
            />
            {errCorreo && (
              <p id="email-error" className={clases.error}>
                {errCorreo}
              </p>
            )}
            <p id="email-ayuda" className={apagaAviso ? "mt-1 text-sm font-medium" : clases.ayuda}>
              {rellenar(apagaAviso ? t.correoAyudaApaga : acepto ? t.correoAyuda : t.correoAyudaPendiente, { nombre: contacto.primerNombre })}
            </p>
          </div>
        </Tarjeta>
      </Pantalla>
    </form>
  );
}
