"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BotonInstalar from "@/components/landing/BotonInstalar";
import { configLanding, RUTA_LANDING } from "@/components/landing/config";
import { textosLanding } from "@/components/landing/textos";
import { EnlaceAlInicio, estiloInsignia, estiloInsigniaSeleccionada } from "@/components/landing/ui";

const t = textosLanding.navegacion;
const ENFOQUE = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary";
const RUTA_ORGANIZACIONES = `${RUTA_LANDING}/organizaciones`;
// "Soy contacto" y "Soy una organización" van iguales, como insignias (badges). En reposo son neutras;
// la que corresponde al lugar donde estás se rellena de oscuro (estado seleccionado).
const insignia = (seleccionada: boolean) => (seleccionada ? estiloInsigniaSeleccionada : estiloInsignia);

// Barra de navegación web. En celular se colapsa en un menú, pero "Instalar" queda siempre visible.
// Los enlaces con ancla llevan siempre a /landing#..., así sirven desde cualquier página de la landing.
export default function BarraNavegacion() {
  const [abierto, setAbierto] = useState(false);
  const botonMenu = useRef<HTMLButtonElement>(null);
  const instalar = `${RUTA_LANDING}#instalar`;
  const ruta = usePathname();
  const enOrganizaciones = ruta === RUTA_ORGANIZACIONES;
  const [enContacto, setEnContacto] = useState(false);

  // En el home, "Soy contacto" se marca mientras su sección ocupa la franja central de la pantalla.
  useEffect(() => {
    const seccion = ruta === RUTA_LANDING ? document.getElementById("contacto") : null;
    if (!seccion) {
      setEnContacto(false);
      return;
    }
    const observador = new IntersectionObserver(([e]) => setEnContacto(e.isIntersecting), {
      rootMargin: "-40% 0px -40% 0px",
    });
    observador.observe(seccion);
    return () => observador.disconnect();
  }, [ruta]);

  useEffect(() => {
    if (!abierto) return;
    function alTeclear(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAbierto(false);
        botonMenu.current?.focus();
      }
    }
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [abierto]);

  const enlaces = (
    <>
      {/* Primero "Soy una organización" (público principal) y luego "Soy contacto". */}
      {configLanding.mostrarOrganizaciones && (
        <Link
          href={RUTA_ORGANIZACIONES}
          className={insignia(enOrganizaciones)}
          aria-current={enOrganizaciones ? "page" : undefined}
          onClick={() => setAbierto(false)}
        >
          {t.organizaciones}
        </Link>
      )}
      <Link
        href={`${RUTA_LANDING}#contacto`}
        className={insignia(enContacto)}
        aria-current={enContacto ? "location" : undefined}
        onClick={() => setAbierto(false)}
      >
        {t.soyContacto}
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-10 border-b border-borde-sutil bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-2">
        {/* Escritorio: el logo y, justo después, las dos insignias a la izquierda; Instalar a la derecha */}
        <div className="flex items-center gap-4">
          <EnlaceAlInicio />
          <nav aria-label={t.etiqueta} className="hidden items-center gap-2 md:flex">
            {enlaces}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <BotonInstalar texto={t.instalar} destino={instalar} className="min-h-12 px-5" />
          <button
            ref={botonMenu}
            type="button"
            aria-expanded={abierto}
            aria-controls="menu-movil"
            onClick={() => setAbierto((v) => !v)}
            className={`inline-flex min-h-12 items-center rounded-xl border border-border px-4 font-semibold hover:bg-fondo-sutil active:bg-gris-200 md:hidden ${ENFOQUE}`}
          >
            {abierto ? t.cerrarMenu : t.abrirMenu}
          </button>
        </div>
      </div>

      {/* Celular: menú desplegable */}
      {abierto && (
        <nav id="menu-movil" aria-label={t.etiqueta} className="border-t border-borde-sutil bg-surface md:hidden">
          <div className="mx-auto flex max-w-5xl flex-col items-start gap-1 px-4 py-3">
            {enlaces}
          </div>
        </nav>
      )}
    </header>
  );
}
