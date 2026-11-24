import type { Metadata } from "next";
import { TOKENS, TEMAS } from "@/lib/ds/tokens";
import { contraste, nivel } from "@/lib/ds/contraste";
import Icono, { NOMBRES_ICONO } from "@/components/ds/Icono";
import { Chip, EnlaceExterno, Lienzo, Seccion, TituloPagina, enFigma } from "../_ui/piezas";

export const metadata: Metadata = { title: "Fundamentos" };

type Color = { valor: string | Record<string, string>; uso: string };
const base = (c: Color) => (typeof c.valor === "string" ? c.valor : c.valor.base);
const numero = (n: number) => n.toLocaleString("es", { minimumFractionDigits: 1, maximumFractionDigits: 2 });

// Pares que el sistema usa de verdad: texto sobre su fondo.
const PARES: { texto: string; fondo: string; uso: "texto" | "control"; donde: string }[] = [
  { texto: "texto/principal", fondo: "fondo/lienzo", uso: "texto", donde: "Texto de la pantalla" },
  { texto: "texto/principal", fondo: "fondo/superficie", uso: "texto", donde: "Texto en tarjetas" },
  { texto: "texto/secundario", fondo: "fondo/superficie", uso: "texto", donde: "Ayudas y metadatos" },
  { texto: "texto/secundario", fondo: "fondo/lienzo", uso: "texto", donde: "Ayudas sobre el lienzo" },
  { texto: "texto/inverso", fondo: "fondo/inverso", uso: "texto", donde: "Tarjeta de Énfasis" },
  { texto: "estado/texto", fondo: "estado/error/fondo", uso: "texto", donde: "Banner de error" },
  { texto: "estado/texto", fondo: "estado/aviso/fondo", uso: "texto", donde: "Banner de aviso" },
  { texto: "texto/sobre-desactivada", fondo: "accion/desactivada", uso: "texto", donde: "Botón deshabilitado" },
  { texto: "borde/control", fondo: "fondo/superficie", uso: "control", donde: "Borde de campos y controles" },
  { texto: "foco/anillo", fondo: "fondo/superficie", uso: "control", donde: "Anillo de foco" },
];

export default function Fundamentos() {
  const colores = TOKENS.color as Record<string, Color>;
  const semanticos = Object.entries(colores);
  const grupos = ["fondo", "texto", "accion", "borde", "foco", "estado"];
  const estilos = Object.entries(TOKENS.tipografia.estilos);

  return (
    <>
      <TituloPagina titulo="Fundamentos">
        Los tokens son las decisiones de diseño con nombre. Viven en Figma como variables y en el código como <Chip>tokens/tokens.json</Chip>, con los mismos nombres. Ningún componente escribe un color o una medida suelta.
      </TituloPagina>

      <Seccion
        id="color"
        titulo="Color"
        descripcion={
          <>
            El sistema es una escala de grises con un solo color de marca: <Chip>accion/principal</Chip>. Los estados (error, aviso, éxito) no usan rojo, amarillo ni verde: se comunican con ícono y palabra, así ninguna marca choca con ellos.
          </>
        }
      >
        <div className="flex flex-col gap-espacio-xl">
          {grupos.map((g) => (
            <div key={g}>
              <h3 className="text-etiqueta capitalize">{g === "accion" ? "Acción" : g}</h3>
              <ul className="mt-espacio-s grid gap-espacio-m sm:grid-cols-2 xl:grid-cols-3">
                {semanticos
                  .filter(([n]) => n.startsWith(`${g}/`))
                  .map(([n, c]) => (
                    <li key={n} className="flex items-center gap-espacio-m rounded-radio-m border border-borde-sutil bg-surface p-espacio-s">
                      {typeof c.valor === "string" ? (
                        <span aria-hidden="true" className="size-12 shrink-0 rounded-radio-s border border-borde-sutil" style={{ background: c.valor }} />
                      ) : (
                        <span aria-hidden="true" className="flex size-12 shrink-0 overflow-hidden rounded-radio-s border border-borde-sutil">
                          {TEMAS.map((t) => (
                            <span key={t} className="flex-1" style={{ background: (c.valor as Record<string, string>)[t] }} />
                          ))}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-mono text-[13px] font-semibold">{n}</p>
                        <p className="font-mono text-[13px] text-text-muted">{typeof c.valor === "string" ? c.valor : TEMAS.map((t) => (c.valor as Record<string, string>)[t]).join(" · ")}</p>
                        <p className="text-pequeno text-text-muted">{c.uso}</p>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-espacio-s">
          <EnlaceExterno href={enFigma("2018:57")}>Variables de color en Figma</EnlaceExterno>
        </div>
      </Seccion>

      <Seccion id="contraste" titulo="Contraste" descripcion="El número se calcula aquí mismo con los valores de los tokens. Mínimos: 4,5:1 en texto y 3:1 en controles (WCAG 2.2 AA).">
        <div className="overflow-x-auto rounded-radio-l border border-borde-sutil bg-surface">
          <table className="w-full min-w-[36rem] text-left text-pequeno">
            <caption className="sr-only">Contraste de los pares de color que usa el sistema</caption>
            <thead>
              <tr className="border-b border-borde-sutil text-text-muted">
                <th scope="col" className="p-espacio-m font-semibold">Muestra</th>
                <th scope="col" className="p-espacio-m font-semibold">Par</th>
                <th scope="col" className="p-espacio-m font-semibold">Dónde</th>
                <th scope="col" className="p-espacio-m text-right font-semibold">Contraste</th>
              </tr>
            </thead>
            <tbody>
              {PARES.map((p) => {
                const a = base(colores[p.texto]);
                const b = base(colores[p.fondo]);
                const c = contraste(a, b);
                return (
                  <tr key={p.texto + p.fondo} className="border-b border-borde-sutil last:border-0">
                    <td className="p-espacio-m">
                      <span className="inline-flex min-w-16 justify-center rounded-radio-s border border-borde-sutil px-espacio-s py-espacio-xs font-semibold" style={{ background: b, color: a }}>
                        Aa
                      </span>
                    </td>
                    <td className="p-espacio-m font-mono text-[13px]">
                      {p.texto}
                      <br />
                      <span className="text-text-muted">sobre {p.fondo}</span>
                    </td>
                    <td className="p-espacio-m">{p.donde}</td>
                    <td className="p-espacio-m text-right tabular-nums">
                      <span className="font-semibold">{numero(c)}:1</span> · {nivel(c, p.uso)}
                    </td>
                  </tr>
                );
              })}
              {TEMAS.map((t) => {
                const a = colores["accion/principal"].valor as Record<string, string>;
                const c = contraste("#ffffff", a[t]);
                return (
                  <tr key={t} className="border-b border-borde-sutil last:border-0">
                    <td className="p-espacio-m">
                      <span className="inline-flex min-w-16 justify-center rounded-radio-s px-espacio-s py-espacio-xs font-semibold" style={{ background: a[t], color: "#ffffff" }}>
                        Aa
                      </span>
                    </td>
                    <td className="p-espacio-m font-mono text-[13px]">
                      texto/inverso
                      <br />
                      <span className="text-text-muted">sobre accion/principal</span>
                    </td>
                    <td className="p-espacio-m">Botón principal · tema {TOKENS.temas[t].nombre}</td>
                    <td className="p-espacio-m text-right tabular-nums">
                      <span className="font-semibold">{numero(c)}:1</span> · {nivel(c)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Seccion>

      <Seccion id="tipografia" titulo="Tipografía" descripcion={`Una sola familia, ${TOKENS.tipografia.familia}, en tres pesos. Cada estilo tiene un uso: se elige por lo que el texto es, no por cómo se ve.`}>
        <Lienzo className="flex flex-col divide-y divide-borde-sutil !p-0">
          {estilos.map(([n, e]) => (
            <div key={n} className="grid gap-espacio-xs p-espacio-l md:grid-cols-[14rem_minmax(0,1fr)] md:items-baseline md:gap-espacio-xl">
              <div>
                <p className="font-mono text-[13px] font-semibold">{n}</p>
                <p className="text-pequeno text-text-muted">
                  {e.tamano}/{e.interlinea} · {e.peso} · <Chip>text-{e.clase}</Chip>
                </p>
              </div>
              <p style={{ fontSize: e.tamano, lineHeight: `${e.interlinea}px`, fontWeight: e.peso }}>{e.uso}</p>
            </div>
          ))}
        </Lienzo>
      </Seccion>

      <Seccion id="espacio" titulo="Espacio, tamaño y radio" descripcion="Siete pasos de espacio en base 4. Los controles miden como mínimo 48 px de alto: es el objetivo táctil de todo el sistema.">
        <div className="grid gap-espacio-l lg:grid-cols-2">
          <Lienzo>
            <h3 className="text-etiqueta">Espacio</h3>
            <ul className="mt-espacio-m flex flex-col gap-espacio-s">
              {Object.entries(TOKENS.espacio).map(([n, d]) => (
                <li key={n} className="grid grid-cols-[8.5rem_3rem_minmax(0,1fr)] items-center gap-espacio-s text-pequeno">
                  <span className="font-mono text-[13px] font-semibold">{n}</span>
                  <span className="tabular-nums text-text-muted">{d.valor} px</span>
                  <span className="flex items-center gap-espacio-s">
                    <span aria-hidden="true" className="h-4 shrink-0 rounded-sm bg-brand-primary" style={{ width: d.valor }} />
                    <span className="truncate text-text-muted">{d.uso}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Lienzo>
          <Lienzo>
            <h3 className="text-etiqueta">Radio</h3>
            <ul className="mt-espacio-m grid grid-cols-2 gap-espacio-m sm:grid-cols-4">
              {Object.entries(TOKENS.radio).map(([n, d]) => (
                <li key={n} className="text-pequeno">
                  <span aria-hidden="true" className="block h-16 border-2 border-brand-primary bg-fondo-sutil" style={{ borderRadius: Math.min(d.valor, 32) }} />
                  <p className="mt-espacio-xs font-mono text-[13px] font-semibold">{n}</p>
                  <p className="text-text-muted">{d.valor === 999 ? "Píldora" : `${d.valor} px`}</p>
                </li>
              ))}
            </ul>
            <h3 className="mt-espacio-xl text-etiqueta">Tamaño</h3>
            <dl className="mt-espacio-s flex flex-col gap-espacio-xs text-pequeno">
              {Object.entries(TOKENS.tamano).map(([n, d]) => (
                <div key={n} className="flex items-baseline justify-between gap-espacio-m">
                  <dt className="font-mono text-[13px] font-semibold">{n}</dt>
                  <dd className="text-right text-text-muted">
                    {d.valor} px · {d.uso}
                  </dd>
                </div>
              ))}
            </dl>
          </Lienzo>
        </div>
      </Seccion>

      <Seccion id="iconos" titulo="Íconos" descripcion={`${NOMBRES_ICONO.length} íconos de trazo (Lucide), los mismos que están en Figma. Acompañan a un texto; si van solos, llevan etiqueta accesible.`}>
        <Lienzo>
          <ul className="grid grid-cols-3 gap-espacio-s sm:grid-cols-5 lg:grid-cols-7">
            {NOMBRES_ICONO.map((n) => (
              <li key={n} className="flex flex-col items-center gap-espacio-xs rounded-radio-s p-espacio-s text-center">
                <Icono nombre={n === "loader-circle" ? "loader-circle" : n} />
                <span className="break-all font-mono text-[11px] text-text-muted">{n}</span>
              </li>
            ))}
          </ul>
        </Lienzo>
        <div className="mt-espacio-s">
          <EnlaceExterno href={enFigma("3879:27386")}>Íconos en Figma</EnlaceExterno>
        </div>
      </Seccion>

      <Seccion id="movimiento" titulo="Movimiento" descripcion="El movimiento confirma lo que pasó: un destino que cambia, un interruptor que se mueve, un check que se dibuja. Nunca decora ni retrasa. Quien pide menos movimiento en su teléfono no ve animaciones.">
        <Lienzo>
          <dl className="flex flex-col gap-espacio-s text-pequeno">
            {Object.entries(TOKENS.movimiento)
              .filter(([n]) => !n.startsWith("$"))
              .map(([n, d]) => (
                <div key={n} className="grid gap-x-espacio-m sm:grid-cols-[11rem_13rem_minmax(0,1fr)]">
                  <dt className="font-mono text-[13px] font-semibold">{n}</dt>
                  <dd className="font-mono text-[13px] text-text-muted">{(d as { valor: string }).valor}</dd>
                  <dd className="text-text-muted">{(d as { uso: string }).uso}</dd>
                </div>
              ))}
          </dl>
        </Lienzo>
      </Seccion>
    </>
  );
}
