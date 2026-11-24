import { IconoAlerta, IconoCheck, IconoCirculoX } from "./iconos";

// Fila de historial (Biblioteca · 05 Tarjetas y contenido): un movimiento pasado y cómo terminó.
// Card Compacta con Contorno: borde sutil, radio 12, relleno 8/16, separación 8.
// Badge: "A tiempo" lleva fondo de éxito con check; "Falsa alarma" y "Alerta vencida" van en oscuro,
// con ícono y palabra (el estado nunca depende solo del color).
// Título (Título/Tarjeta 20/28) = "nombre del aviso · día". Cuerpo (16/24) en texto secundario.

export type ResultadoFila = "a-tiempo" | "falsa-alarma" | "vencida" | "en-curso";

const BADGE: Record<ResultadoFila, { fondo: string; icono: React.ReactNode }> = {
  "a-tiempo": { fondo: "bg-estado-exito-fondo text-text", icono: <IconoCheck /> },
  "falsa-alarma": { fondo: "bg-fondo-inverso text-brand-on-primary", icono: <IconoAlerta /> },
  vencida: { fondo: "bg-fondo-inverso text-brand-on-primary", icono: <IconoCirculoX /> },
  "en-curso": { fondo: "bg-fondo-inverso text-brand-on-primary", icono: <IconoAlerta /> },
};

export default function FilaHistorial({ resultado, etiqueta, titulo, children }: { resultado: ResultadoFila; etiqueta: string; titulo: string; children: React.ReactNode }) {
  const b = BADGE[resultado];
  return (
    <article className="flex flex-col gap-espacio-s rounded-[var(--spacing-radio-m)] border border-borde-sutil bg-surface px-espacio-l py-espacio-s">
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-espacio-s rounded-[var(--spacing-radio-pill)] px-espacio-s py-espacio-xs text-sm leading-[21px] ${b.fondo}`}>
          {b.icono}
          {etiqueta}
        </span>
      </div>
      <h2 className="text-tarjeta leading-7">{titulo}</h2>
      <div className="space-y-1 text-base leading-6 text-text-muted">{children}</div>
    </article>
  );
}
