"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import Icono, { type NombreIcono } from "./Icono";
import { Boton } from "./Boton";
import { FOCO } from "./estilos";

// 06 · Mensajes del sistema. Ninguno depende solo del color: siempre llevan ícono y título.

// Banner de sistema (Figma 3693:26723). Se queda hasta que el problema se resuelve.
// Error: algo falló y se puede reintentar (role="alert"). Sin conexión y Enviando: role="status".
const BANNER: Record<"error" | "sin-conexion" | "enviando", { fondo: string; icono: NombreIcono; rol: "alert" | "status" }> = {
  error: { fondo: "bg-estado-error-fondo", icono: "circle-alert", rol: "alert" },
  "sin-conexion": { fondo: "bg-estado-aviso-fondo", icono: "wifi-off", rol: "status" },
  enviando: { fondo: "bg-fondo-sutil", icono: "loader-circle", rol: "status" },
};

export function Banner({ tipo, titulo, children, accion }: { tipo: keyof typeof BANNER; titulo: string; children?: ReactNode; accion?: ReactNode }) {
  const b = BANNER[tipo];
  return (
    <div role={b.rol} className={`flex flex-col gap-espacio-s rounded-radio-m p-espacio-m text-estado-o ${b.fondo}`}>
      <p className="flex items-start gap-espacio-s text-etiqueta">
        <Icono nombre={b.icono} />
        <span>{titulo}</span>
      </p>
      {children && <p className="pl-8 text-pequeno">{children}</p>}
      {accion && <div className="pl-8">{accion}</div>}
    </div>
  );
}

// Toast (Figma 3713:2996): la parte visible. Confirma algo que ya pasó y se va solo.
// La lógica de aparecer, anunciarse y cerrarse vive en components/emisor/Toast.tsx, que usa esta pieza.
export function ToastVisual({ texto, descripcion, alCerrar, cerrar = "Cerrar aviso", accion, ...eventos }: { texto: string; descripcion?: string; alCerrar?: () => void; cerrar?: string; accion?: ReactNode } & Pick<React.HTMLAttributes<HTMLDivElement>, "onMouseEnter" | "onMouseLeave" | "onFocus" | "onBlur">) {
  return (
    <div {...eventos} className="pointer-events-auto flex w-full max-w-sm animate-ds-entrar items-start gap-espacio-s rounded-radio-m border border-borde-sutil bg-fondo-sutil p-espacio-m text-estado-o shadow-[0_8px_24px_-8px_rgb(0_0_0/0.35)]">
      <Icono nombre="check" className="mt-px" />
      <div className="min-w-0 flex-1">
        <p className="text-etiqueta">{texto}</p>
        {descripcion && <p className="text-pequeno">{descripcion}</p>}
        {accion && <div className="mt-espacio-xs">{accion}</div>}
      </div>
      {alCerrar && (
        <button type="button" onClick={alCerrar} aria-label={cerrar} className={`-my-2 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-radio-s ${FOCO}`}>
          <Icono nombre="x" tamano={20} />
        </button>
      )}
    </div>
  );
}

// Diálogo de confirmación (Figma 3714:4805). Confirmación: se puede revertir. Destructiva: no se puede
// deshacer (role="alertdialog"). El botón principal dice exactamente lo que va a pasar y Cancelar siempre está.
// Usa <dialog> nativo: el foco entra al abrir, no sale mientras está abierto, Esc cierra y el foco vuelve
// al botón que lo abrió. El fondo atenuado es negro al 45 % (Figma 5039:73302).
export function Dialogo({
  abierto,
  alCerrar,
  tipo = "confirmacion",
  titulo,
  children,
  confirmar,
  alConfirmar,
  cancelar = "Cancelar",
  cargando = false,
}: {
  abierto: boolean;
  alCerrar: () => void;
  tipo?: "confirmacion" | "destructiva";
  titulo: string;
  children?: ReactNode;
  confirmar: string;
  alConfirmar: () => void;
  cancelar?: string;
  cargando?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) d.showModal();
    if (!abierto && d.open) d.close();
  }, [abierto]);
  return (
    <dialog
      ref={ref}
      role={tipo === "destructiva" ? "alertdialog" : undefined}
      aria-labelledby={`${id}-titulo`}
      aria-describedby={children ? `${id}-texto` : undefined}
      onClose={alCerrar}
      onClick={(e) => {
        // Tocar el fondo atenuado cierra, salvo en la destructiva: ahí hay que elegir.
        if (e.target === ref.current && tipo !== "destructiva") alCerrar();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-radio-l bg-surface p-0 text-text backdrop:bg-negro/45 open:animate-ds-aparecer"
    >
      <div className="flex flex-col gap-espacio-m p-espacio-xl">
        {tipo === "destructiva" && <Icono nombre="triangle-alert" />}
        <h2 id={`${id}-titulo`} className="text-tarjeta">
          {titulo}
        </h2>
        {children && (
          <div id={`${id}-texto`} className="text-cuerpo text-text-muted">
            {children}
          </div>
        )}
        <div className="flex flex-col gap-espacio-s pt-espacio-s">
          <Boton onClick={alConfirmar} cargando={cargando}>
            {confirmar}
          </Boton>
          <Boton tipo="secundario" onClick={alCerrar} disabled={cargando}>
            {cancelar}
          </Boton>
        </div>
      </div>
    </dialog>
  );
}

// Indicador/Cargando (Figma 3956:29967): con pista gris. Decorativo: el texto de al lado dice qué pasa.
export function Cargando({ tamano = 24, className = "" }: { tamano?: 24 | 20; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`${tamano === 24 ? "size-6" : "size-5"} shrink-0 animate-spin motion-reduce:animate-none ${className}`} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  );
}

// Doble check: la confirmación que se dibuja. Primero un trazo y enseguida el segundo.
// Es un refuerzo visual: el texto de la pantalla ya dice que quedó confirmado.
export function DobleCheck({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`inline-flex size-16 animate-ds-aparecer items-center justify-center rounded-full bg-brand-primary text-brand-on-primary ${className}`}>
      <svg viewBox="0 0 32 24" className="h-7 w-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 13l6 6L20 5" pathLength={1} strokeDasharray={1} className="animate-ds-check" />
        <path d="M14 17l2 2L30 5" pathLength={1} strokeDasharray={1} strokeDashoffset={1} className="animate-ds-check-2" />
      </svg>
    </span>
  );
}
