import Link from "next/link";

// Piezas de pantalla compartidas por el flujo de quien emite (alta, contactos, aviso, inicio).
// Equivalen a componentes de la Biblioteca (Barra de título, Stepper, Card, Zona de acción fija,
// Action Button, Badge). Solo usan los tokens de app/globals.css.

export const clases = {
  principal:
    "flex min-h-12 w-full items-center justify-center rounded-lg bg-brand-primary px-4 py-3 font-semibold text-brand-on-primary disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary",
  secundario:
    "flex min-h-12 w-full items-center justify-center rounded-lg border border-border bg-surface px-4 py-3 font-semibold text-text disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary",
  enlace:
    "inline-flex min-h-11 items-center font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-brand-primary",
  campo:
    "w-full min-h-12 rounded-lg border border-border bg-surface px-3 py-2 text-text focus:outline-2 focus:outline-brand-primary aria-[invalid=true]:border-danger aria-[invalid=true]:border-2",
  etiqueta: "mb-1 block font-semibold",
  ayuda: "mt-1 text-sm text-text-muted",
  error: "mt-1 text-sm font-medium text-danger",
};

export function Pantalla({ children, pie }: { children: React.ReactNode; pie?: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-surface-muted">
      <main className="flex-1 space-y-4 p-4 pb-8">{children}</main>
      {pie && (
        // Zona de acción fija: deja el foco visible al hacer scroll (WCAG 2.4.12).
        <div className="sticky bottom-0 space-y-2 border-t border-border/40 bg-surface p-4">{pie}</div>
      )}
    </div>
  );
}

export function BarraTitulo({ titulo, volverHref, onVolver }: { titulo: string; volverHref?: string; onVolver?: () => void }) {
  const flecha = (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const claseVolver = "inline-flex size-11 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-brand-primary";
  return (
    <header className="flex items-center gap-1">
      {volverHref && (
        <Link href={volverHref} className={claseVolver} aria-label="Volver">
          {flecha}
        </Link>
      )}
      {!volverHref && onVolver && (
        <button type="button" onClick={onVolver} className={claseVolver} aria-label="Volver">
          {flecha}
        </button>
      )}
      <h1 className="text-lg font-semibold">{titulo}</h1>
    </header>
  );
}

// Stepper: "Paso 1 de 3" + barras + "Siguiente: …".
export function Progreso({ actual, total, siguiente }: { actual: number; total: number; siguiente?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-semibold">
          Paso {actual} de {total}
        </p>
        {siguiente && <p className="text-sm text-text-muted">{siguiente}</p>}
      </div>
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-1 flex-1 rounded-full ${i < actual ? "bg-brand-primary" : "bg-border/40"}`} />
        ))}
      </div>
    </div>
  );
}

export function Tarjeta({
  titulo,
  children,
  accion,
  id,
}: {
  titulo?: string;
  children: React.ReactNode;
  accion?: React.ReactNode;
  id?: string;
}) {
  return (
    <section aria-labelledby={titulo && id ? id : undefined} className="space-y-3 rounded-xl bg-surface p-4">
      {(titulo || accion) && (
        <div className="flex items-center justify-between gap-2">
          {titulo && (
            // El título de cada Card se marca como encabezado (WCAG 2.4.10).
            <h2 id={id} className="font-semibold">
              {titulo}
            </h2>
          )}
          {accion}
        </div>
      )}
      {children}
    </section>
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-sm font-medium">
      {children}
    </span>
  );
}

export function Numero({ n }: { n: number }) {
  return (
    <span aria-hidden="true" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-muted font-semibold">
      {n}
    </span>
  );
}

export function EnlaceBoton({ href, children, tipo = "principal" }: { href: string; children: React.ReactNode; tipo?: "principal" | "secundario" }) {
  return (
    <Link href={href} className={tipo === "principal" ? clases.principal : clases.secundario}>
      {children}
    </Link>
  );
}
