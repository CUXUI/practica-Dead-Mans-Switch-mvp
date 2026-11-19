import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { configLanding, RUTA_LANDING } from "@/components/landing/config";
import { textosLanding } from "@/components/landing/textos";
import { estiloEnlaceTexto } from "@/components/landing/ui";

const t = textosLanding.paginaOrganizaciones;

export const metadata: Metadata = { title: { absolute: `${t.titulo} · ${configLanding.nombre}` } };

// Explica a las organizaciones que pueden personalizar la app. No hay simulador ni controles.
// Se oculta por configuración (configLanding.mostrarOrganizaciones).
export default function OrganizacionesPage() {
  if (!configLanding.mostrarOrganizaciones) notFound();
  return (
    <div className="bg-surface">
      <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <p className="text-sm font-semibold text-text-muted">{t.titulo}</p>
        <h1 className="mt-2 text-[32px] font-bold leading-10 md:text-4xl">{t.entrada}</h1>
        <p className="mt-4 text-lg text-text-muted">{t.cuerpo}</p>

        <section aria-labelledby="personalizas" className="mt-10">
          <h2 id="personalizas" className="text-2xl font-bold leading-8">
            {t.personalizas.titulo}
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {t.personalizas.puntos.map((p) => (
              <li
                key={p}
                className="flex flex-col items-center gap-4 rounded-2xl border border-borde-sutil bg-surface p-6 text-center"
              >
                {/* ESPACIO PARA ICONO O IMAGEN: reemplazar este recuadro por el icono/imagen de cada tarjeta.
                    Es decorativo (aria-hidden); si la imagen aporta información, darle texto alternativo. */}
                <div
                  aria-hidden="true"
                  className="flex h-28 w-full items-center justify-center rounded-xl bg-fondo-sutil"
                />
                <p className="font-semibold">{p}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="misma-app" className="mt-10">
          <h2 id="misma-app" className="text-2xl font-bold leading-8">
            {t.mismaApp.titulo}
          </h2>
          <p className="mt-3 text-text-muted">{t.mismaApp.cuerpo}</p>
        </section>

        <Link href={RUTA_LANDING} className={`${estiloEnlaceTexto} mt-10`}>
          {t.volver}
        </Link>
      </div>
    </div>
  );
}
