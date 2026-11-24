import type { ReactNode } from "react";
import Icono, { type NombreIcono } from "./Icono";
import { badge, card, FOCO, type DensidadCard, type TipoBadge, type TonoCard } from "./estilos";

// 05 · Tarjetas y contenido. Componentes de presentación: sirven en servidor y en cliente.

// Badge (Figma 2675:5424). Claro, Oscuro, Éxito (con check) o Etiqueta (mayúsculas sin fondo).
// En la Card de Énfasis se usa siempre Claro.
export function Badge({ tipo = "claro", icono, children }: { tipo?: TipoBadge; icono?: NombreIcono; children: ReactNode }) {
  const ic = icono ?? (tipo === "exito" ? "check" : undefined);
  return (
    <span className={badge[tipo]}>
      {ic && <Icono nombre={ic} tamano={16} />}
      <span className="min-w-0">{children}</span>
    </span>
  );
}

// Card (Figma 2675:5520). Tono: Contorno (blanco + borde), Neutra (gris) o Énfasis (oscuro, texto claro).
// Bloques de arriba a abajo, todos opcionales: encabezado (Badge), título, contenido y acciones.
export function Card({
  tono = "contorno",
  densidad = "normal",
  encabezado,
  titulo,
  nivelTitulo = 2,
  accionEsquina,
  acciones,
  children,
  id,
  className = "",
}: {
  tono?: TonoCard;
  densidad?: DensidadCard;
  encabezado?: ReactNode;
  titulo?: string;
  nivelTitulo?: 2 | 3;
  accionEsquina?: ReactNode;
  acciones?: ReactNode;
  children?: ReactNode;
  id?: string;
  className?: string;
}) {
  const Titulo = nivelTitulo === 2 ? "h2" : "h3";
  return (
    <section aria-labelledby={titulo && id ? `${id}-titulo` : undefined} className={`${card(tono, densidad)} ${className}`}>
      {(encabezado || accionEsquina) && (
        <div className="flex items-center justify-between gap-espacio-s">
          <div className="min-w-0">{encabezado}</div>
          {accionEsquina && <div className="shrink-0">{accionEsquina}</div>}
        </div>
      )}
      {titulo && (
        <Titulo id={id ? `${id}-titulo` : undefined} className="text-tarjeta">
          {titulo}
        </Titulo>
      )}
      {children}
      {acciones && <div className="flex flex-col gap-espacio-s pt-espacio-xs">{acciones}</div>}
    </section>
  );
}

// Dato grande de la Card: «18 min para confirmar».
export function DatoGrande({ valor, sufijo }: { valor: string; sufijo?: string }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-espacio-s">
      <span className="text-seccion tabular-nums">{valor}</span>
      {sufijo && <span className="text-pequeno opacity-80">{sufijo}</span>}
    </p>
  );
}

// Fila de info (Figma 2675:5428): ícono a la izquierda y texto que salta de línea.
export function FilaInfo({ icono, children }: { icono: NombreIcono; children: ReactNode }) {
  return (
    <p className="flex items-start gap-espacio-s text-pequeno">
      <Icono nombre={icono} tamano={20} className="mt-px" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

// Fila de dato (Figma 2675:5433): etiqueta y valor en los extremos. Va en una <dl>.
export function FilaDato({ etiqueta, valor }: { etiqueta: string; valor: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-espacio-m text-pequeno">
      <dt className="text-text-muted">{etiqueta}</dt>
      <dd className="text-right font-semibold">{valor}</dd>
    </div>
  );
}

// Paso (Figma 2765:9676): círculo con número o ícono, título y descripción. Va en una <ol>.
export function Paso({ numero, icono, titulo, descripcion }: { numero?: number; icono?: NombreIcono; titulo: string; descripcion?: string }) {
  return (
    <li className="flex items-start gap-espacio-m">
      <span aria-hidden="true" className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-fondo-sutil text-pequeno font-semibold text-text">
        {icono ? <Icono nombre={icono} tamano={16} /> : numero}
      </span>
      <div className="min-w-0 pt-1">
        <p className="text-etiqueta">{titulo}</p>
        {descripcion && <p className="text-pequeno text-text-muted">{descripcion}</p>}
      </div>
    </li>
  );
}

// Contacto (Figma 2675:5436): iniciales o número, nombre, subtítulo, estado y acción.
export function Contacto({ nombre, subtitulo, orden, estado, accion }: { nombre: string; subtitulo?: string; orden?: number; estado?: ReactNode; accion?: ReactNode }) {
  const iniciales = nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
  return (
    <div className="flex items-center gap-espacio-m">
      <span aria-hidden="true" className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-fondo-sutil text-pequeno font-semibold text-text">
        {orden ?? iniciales}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-etiqueta">{nombre}</p>
        {subtitulo && <p className="text-pequeno text-text-muted">{subtitulo}</p>}
        {estado && <div className="mt-espacio-xs">{estado}</div>}
      </div>
      {accion && <div className="shrink-0">{accion}</div>}
    </div>
  );
}

// Estado vacío (Figma 3724:27226): ícono decorativo, título, qué va a pasar y una acción opcional.
export function EstadoVacio({ icono = "shield", titulo, children, accion }: { icono?: NombreIcono; titulo: string; children?: ReactNode; accion?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-espacio-s px-espacio-l py-espacio-2xl text-center">
      <Icono nombre={icono} className="text-text-muted" />
      <p className="text-bloque">{titulo}</p>
      {children && <p className="max-w-xs text-pequeno text-text-muted">{children}</p>}
      {accion && <div className="mt-espacio-s w-full max-w-xs">{accion}</div>}
    </div>
  );
}

// Desplegable (Figma 3823:17052). Estilo Lista (línea abajo) o Tarjeta (caja con borde). Usa <details>:
// funciona sin JavaScript, con teclado y con lector de pantalla. No lleva a otra pantalla.
export function Desplegable({ pregunta, estilo = "lista", abierto = false, children }: { pregunta: string; estilo?: "lista" | "tarjeta"; abierto?: boolean; children: ReactNode }) {
  const caja = estilo === "tarjeta" ? "rounded-radio-m border border-borde-sutil bg-surface px-espacio-s" : "border-b border-borde-sutil";
  return (
    <details open={abierto} className={`group ${caja}`}>
      <summary className={`flex min-h-12 list-none items-center justify-between gap-espacio-m rounded-radio-s py-espacio-xs text-etiqueta [&::-webkit-details-marker]:hidden ${estilo === "tarjeta" ? "px-espacio-s" : ""} ${FOCO}`}>
        <span>{pregunta}</span>
        <Icono nombre="chevron-down" className="transition-transform duration-(--duracion-media) ease-estandar group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <div className={`pb-espacio-l text-cuerpo text-text-muted ${estilo === "tarjeta" ? "border-t border-borde-sutil px-espacio-s pt-espacio-m" : ""}`}>{children}</div>
    </details>
  );
}
