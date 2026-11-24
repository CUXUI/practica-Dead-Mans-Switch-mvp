"use client";

import { useId, useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import Icono from "./Icono";
import { campo, FOCO } from "./estilos";

// Campo/Input (Figma 2293:1356). Etiqueta siempre visible arriba, ayuda y error debajo.
// El error no depende del color: lleva borde más grueso, ícono y texto, y se anuncia (role="alert").
type Comun = {
  etiqueta: string;
  ayuda?: string;
  error?: string;
};

export function Campo({ etiqueta, ayuda, error, tipo = "texto", className = "", ...rest }: Comun & Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { tipo?: "texto" | "correo" | "telefono" | "contrasena" }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const type = tipo === "contrasena" ? (visible ? "text" : "password") : tipo === "correo" ? "email" : tipo === "telefono" ? "tel" : "text";
  const describe = [ayuda && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className={campo.etiqueta}>
        {etiqueta}
      </label>
      <div className="relative">
        <input id={id} type={type} aria-invalid={error ? true : undefined} aria-describedby={describe} className={`${campo.control} ${tipo === "contrasena" ? "pr-14" : ""}`} {...rest} />
        {tipo === "contrasena" && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-pressed={visible}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            className={`absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-radio-m text-text ${FOCO}`}
          >
            <Icono nombre={visible ? "eye-off" : "eye"} />
          </button>
        )}
      </div>
      {ayuda && (
        <p id={`${id}-ayuda`} className={campo.ayuda}>
          {ayuda}
        </p>
      )}
      <MensajeError id={`${id}-error`} texto={error} />
    </div>
  );
}

// Área de texto con contador «0 / 300».
export function AreaTexto({ etiqueta, ayuda, error, maximo, value, className = "", ...rest }: Comun & TextareaHTMLAttributes<HTMLTextAreaElement> & { maximo?: number }) {
  const id = useId();
  const largo = typeof value === "string" ? value.length : 0;
  const describe = [ayuda && `${id}-ayuda`, error && `${id}-error`, maximo && `${id}-contador`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className={campo.etiqueta}>
        {etiqueta}
      </label>
      <textarea id={id} rows={3} value={value} maxLength={maximo} aria-invalid={error ? true : undefined} aria-describedby={describe} className={`${campo.control} resize-y`} {...rest} />
      <div className="flex items-start justify-between gap-espacio-m">
        <div className="min-w-0">
          {ayuda && (
            <p id={`${id}-ayuda`} className={campo.ayuda}>
              {ayuda}
            </p>
          )}
          <MensajeError id={`${id}-error`} texto={error} />
        </div>
        {maximo && (
          <p id={`${id}-contador`} className={`${campo.ayuda} shrink-0 tabular-nums`}>
            {largo} / {maximo}
          </p>
        )}
      </div>
    </div>
  );
}

export function MensajeError({ id, texto }: { id?: string; texto?: string }) {
  if (!texto) return null;
  return (
    <p id={id} role="alert" className={campo.error}>
      <Icono nombre="circle-alert" tamano={20} />
      <span>{texto}</span>
    </p>
  );
}
