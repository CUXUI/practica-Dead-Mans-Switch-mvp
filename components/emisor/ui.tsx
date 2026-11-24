import BotonEnlace from "./BotonEnlace";
import { boton, campo, card, enlace as recetaEnlace } from "@/components/ds/estilos";
import { Badge as BadgeDS } from "@/components/ds/Contenido";
import { BarraTitulo as BarraTituloDS, MarcaApp, Stepper } from "@/components/ds/Navegacion";

// Piezas de pantalla compartidas por el flujo de quien emite (alta, contactos, aviso, inicio).
// Equivalen a componentes de la Biblioteca (Barra de título, Stepper, Card, Zona de acción fija,
// Action Button, Badge). Solo usan los tokens de app/globals.css.

// Las clases salen de las recetas del design system (components/ds/estilos.ts): un solo lugar para cambiarlas.
export const clases = {
  principal: boton.principal,
  secundario: boton.secundario,
  enlace: recetaEnlace,
  campo: campo.control,
  etiqueta: campo.etiqueta,
  ayuda: campo.ayuda,
  error: campo.error.replace("flex items-start gap-espacio-xs ", ""),
};

// pie = botones fijos (flujos de pasos). nav = menú principal. Nunca los dos a la vez.
export function Pantalla({ children, pie, nav }: { children: React.ReactNode; pie?: React.ReactNode; nav?: React.ReactNode }) {
  return (
    <div className="fixed inset-0 mx-auto flex max-w-md flex-col bg-surface-muted">
      <main className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 pb-8">{children}</main>
      {pie && (
        // Zona de acción fija: deja el foco visible al hacer scroll (WCAG 2.4.12).
        <div className="shrink-0 space-y-2 border-t border-borde-sutil bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{pie}</div>
      )}
      {nav}
    </div>
  );
}

// Encabezado de la app (Biblioteca, "Encabezado"): logo y nombre de la marca, con línea inferior.
// Va arriba en las pantallas con menú (Inicio, Contactos, Historial, Ajustes). Logo de ejemplo (marca blanca).
export function Encabezado({ nombre }: { nombre: string }) {
  return (
    <header className="-mx-4 -mt-4 flex items-center border-b border-borde-sutil bg-surface px-4 py-2">
      <MarcaApp nombre={nombre} />
    </header>
  );
}

export function BarraTitulo({ titulo, volverHref, onVolver }: { titulo: string; volverHref?: string; onVolver?: () => void }) {
  return <BarraTituloDS titulo={titulo} volverHref={volverHref} alVolver={onVolver} />;
}

// Stepper: "Paso 1 de 3" + barras + "Siguiente: …".
export function Progreso({ actual, total, siguiente }: { actual: number; total: number; siguiente?: string }) {
  return <Stepper actual={actual} total={total} siguiente={siguiente} />;
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
    <section aria-labelledby={titulo && id ? id : undefined} className={`${card("contorno")} px-espacio-l`}>
      {(titulo || accion) && (
        <div className="flex items-center justify-between gap-2">
          {titulo && (
            // El título de cada Card se marca como encabezado (WCAG 2.4.10).
            <h2 id={id} className="font-semibold">
              {titulo}
            </h2>
          )}
          {accion && <div className="ml-auto">{accion}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return <BadgeDS>{children}</BadgeDS>;
}

export function Numero({ n }: { n: number }) {
  return (
    <span aria-hidden="true" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-fondo-sutil font-semibold">
      {n}
    </span>
  );
}

export function EnlaceBoton({ href, children, tipo = "principal" }: { href: string; children: React.ReactNode; tipo?: "principal" | "secundario" }) {
  return (
    <BotonEnlace href={href} className={tipo === "principal" ? clases.principal : clases.secundario}>
      {children}
    </BotonEnlace>
  );
}
