import Link from "next/link";
import { configLanding, RUTA_LANDING } from "@/components/landing/config";
import { textosLanding } from "@/components/landing/textos";
import { Logo } from "@/components/landing/ui";

// Pie de la landing. Sin enlace a la baja por ahora (pendiente de confirmar con el equipo).
export default function Pie() {
  const t = textosLanding.pie;
  return (
    <footer aria-label={t.etiqueta} className="border-t border-borde-sutil bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
        <Logo />
        <nav aria-label={t.etiqueta} className="flex flex-wrap items-center gap-x-6">
          {/* PENDIENTE: enlazar la política de privacidad cuando exista. */}
          {configLanding.mostrarOrganizaciones && (
            <Link href={`${RUTA_LANDING}/organizaciones`} className="inline-flex min-h-12 items-center text-sm text-text-muted underline underline-offset-4 hover:text-text hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">
              {t.organizaciones}
            </Link>
          )}
        </nav>
      </div>
    </footer>
  );
}
