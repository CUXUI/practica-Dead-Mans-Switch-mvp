"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { alCambiarAviso, detectarPlataforma, estaInstalada, hayAvisoInstalacion, instalarConAviso } from "@/components/landing/instalacion";
import { textosLanding } from "@/components/landing/textos";
import { estiloBotonPrincipal } from "@/components/landing/ui";

const t = textosLanding.instalar;
type Pestana = "iphone" | "android";
const PESTANAS: Pestana[] = ["iphone", "android"];

// Pestañas iPhone / Android con el paso a paso. Se abre la del dispositivo detectado.
// El botón Instalar aparece solo donde el navegador lo permite (Android/Chrome).
export default function InstalarApp() {
  const [activa, setActiva] = useState<Pestana>("iphone");
  const [hayBoton, setHayBoton] = useState(false);
  const [instalada, setInstalada] = useState(false);
  const refs = useRef<Record<Pestana, HTMLButtonElement | null>>({ iphone: null, android: null });

  useEffect(() => {
    if (detectarPlataforma() === "android") setActiva("android");
    setInstalada(estaInstalada());
    setHayBoton(hayAvisoInstalacion());
    return alCambiarAviso(() => {
      setHayBoton(hayAvisoInstalacion());
      setInstalada(estaInstalada());
    });
  }, []);

  function alTeclear(e: KeyboardEvent<HTMLButtonElement>) {
    const i = PESTANAS.indexOf(activa);
    let siguiente: Pestana | null = null;
    if (e.key === "ArrowRight") siguiente = PESTANAS[(i + 1) % PESTANAS.length];
    if (e.key === "ArrowLeft") siguiente = PESTANAS[(i - 1 + PESTANAS.length) % PESTANAS.length];
    if (e.key === "Home") siguiente = PESTANAS[0];
    if (e.key === "End") siguiente = PESTANAS[PESTANAS.length - 1];
    if (!siguiente) return;
    e.preventDefault();
    setActiva(siguiente);
    refs.current[siguiente]?.focus();
  }

  const pasos = activa === "iphone" ? t.iphone : t.android;

  return (
    <div>
      <p className="max-w-prose text-text-muted">{t.cuerpo}</p>

      <div className="mt-6 max-w-xl">
        <div role="tablist" aria-label={t.pestanas.etiqueta} className="grid grid-cols-2 gap-1 rounded-xl bg-fondo-sutil p-1">
          {PESTANAS.map((p) => (
            <button
              key={p}
              ref={(el) => {
                refs.current[p] = el;
              }}
              id={`tab-${p}`}
              role="tab"
              type="button"
              aria-selected={activa === p}
              aria-controls={`panel-${p}`}
              tabIndex={activa === p ? 0 : -1}
              onClick={() => setActiva(p)}
              onKeyDown={alTeclear}
              className={`min-h-12 rounded-lg px-4 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${
                activa === p ? "bg-surface text-text shadow-sm" : "text-text-muted hover:bg-gris-200 hover:text-text"
              }`}
            >
              {t.pestanas[p]}
            </button>
          ))}
        </div>

        <div id={`panel-${activa}`} role="tabpanel" aria-labelledby={`tab-${activa}`} className="mt-4">
          <ol className="space-y-4 rounded-2xl border border-borde-sutil bg-surface p-4">
            {pasos.map((paso, i) => (
              <li key={paso} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-fondo-sutil text-sm font-semibold"
                >
                  {i + 1}
                </span>
                <span className="pt-0.5">{paso}</span>
              </li>
            ))}
          </ol>
        </div>

        {instalada ? (
          <p role="status" className="mt-4 rounded-xl border border-borde-sutil bg-surface p-4">
            {t.yaInstalada}
          </p>
        ) : (
          hayBoton && (
            <button type="button" onClick={() => void instalarConAviso()} className={`${estiloBotonPrincipal} mt-4 w-full`}>
              {t.boton}
            </button>
          )
        )}
      </div>
    </div>
  );
}
