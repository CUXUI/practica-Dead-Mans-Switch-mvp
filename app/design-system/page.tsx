import type { Metadata } from "next";
import Link from "next/link";
import { TOKENS, TEMAS } from "@/lib/ds/tokens";
import { NOMBRES_ICONO } from "@/components/ds/Icono";
import Icono, { type NombreIcono } from "@/components/ds/Icono";
import { BotonEnlace } from "@/components/ds/Boton";
import { FOCO } from "@/components/ds/estilos";
import { COBERTURA } from "./_datos/cobertura";
import { Seccion, Telefono } from "./_ui/piezas";
import PantallaProducto from "./_ui/Pantallas";

export const metadata: Metadata = { title: "Design system" };
export const dynamic = "force-dynamic";

const ENTRADAS: { href: string; icono: NombreIcono; titulo: string; texto: string }[] = [
  { href: "/design-system/fundamentos", icono: "sliders-horizontal", titulo: "Fundamentos", texto: "Color, contraste, tipografía, espacio, íconos y movimiento." },
  { href: "/design-system/componentes", icono: "list", titulo: "Componentes", texto: "Cada componente funcionando, con su uso, su accesibilidad y su código." },
  { href: "/design-system/temas", icono: "heart", titulo: "Temas de marca", texto: "La misma app con tres marcas. Cámbiala en vivo." },
  { href: "/design-system/producto", icono: "house", titulo: "En el producto", texto: "Pantallas reales y qué pieza del sistema usa cada una." },
  { href: "/design-system/estado", icono: "check", titulo: "Estado y enlaces", texto: "Figma ↔ código, fila por fila, y lo que falta alinear." },
];

const PRINCIPIOS = [
  { t: "Calma antes que alarma", d: "El producto acompaña a quien vive o sale sola. El sistema es gris y sereno; el color de marca aparece poco y nunca significa error." },
  { t: "Nada depende solo del color", d: "Cada estado lleva ícono y palabra. Lo elegido cambia de forma o de peso. Funciona en escala de grises y con cualquier marca." },
  { t: "48 px al alcance del pulgar", d: "Todo lo que se toca mide al menos 48 px y lo importante queda abajo, donde llega el pulgar con el teléfono en una mano." },
  { t: "Una marca es un token", d: "Cerca, Montaña o la que venga: cambia accion/principal y el resto se queda igual. Los pasos y los estados son los mismos en todas." },
];

export default function InicioDS() {
  const construidos = COBERTURA.filter((f) => f.estado === "sistema" || f.estado === "producto").length;
  const nTokens = Object.keys(TOKENS.color).length + Object.keys(TOKENS.colorPrimitivo).length + Object.keys(TOKENS.espacio).length + Object.keys(TOKENS.tamano).length + Object.keys(TOKENS.radio).length + Object.keys(TOKENS.tipografia.estilos).length;
  const cifras = [
    { n: nTokens, t: "tokens con el mismo nombre en Figma y en código" },
    { n: construidos, t: "componentes de Figma construidos" },
    { n: NOMBRES_ICONO.length, t: "íconos" },
    { n: TEMAS.length, t: "temas de marca" },
  ];

  return (
    <>
      <div className="mb-espacio-seccion grid items-center gap-espacio-2xl lg:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <p className="text-pequeno font-semibold uppercase tracking-wide text-text-muted">Design system · marca blanca</p>
          <h1 className="mt-espacio-s text-[2.5rem] font-bold leading-[1.1] tracking-tight sm:text-[3.25rem]">Un sistema, cualquier marca.</h1>
          <p className="mt-espacio-l max-w-xl text-bloque font-normal text-text-muted">
            El diseño de Figma, los tokens, los componentes y el producto dicen lo mismo. Esta documentación vive dentro de la app: todo lo que ves aquí es lo que está en producción.
          </p>
          <div className="mt-espacio-xl flex flex-wrap gap-espacio-m">
            <BotonEnlace href="/design-system/temas" ancho="contenido" icono="arrow-right">
              Cambiar de marca en vivo
            </BotonEnlace>
            <BotonEnlace href="/design-system/componentes" tipo="secundario" ancho="contenido">
              Ver componentes
            </BotonEnlace>
          </div>
          <dl className="mt-espacio-2xl grid max-w-xl grid-cols-2 gap-x-espacio-xl gap-y-espacio-l sm:grid-cols-4">
            {cifras.map((c) => (
              <div key={c.t}>
                <dd className="text-pantalla tabular-nums">{c.n}</dd>
                <dt className="text-pequeno text-text-muted">{c.t}</dt>
              </div>
            ))}
          </dl>
        </div>
        <div className="hidden justify-self-center lg:block">
          <Telefono etiqueta="Inicio del producto, con el tema elegido arriba">
            <PantallaProducto id="activo" />
          </Telefono>
        </div>
      </div>

      <Seccion id="cadena" titulo="De Figma al producto, sin saltos" descripcion="Cada eslabón tiene un solo lugar. Cuando algo cambia, se cambia ahí y lo demás lo sigue.">
        <ol className="grid gap-espacio-m md:grid-cols-4">
          {[
            { n: "1", t: "Figma", d: "Variables con modos por marca y la Biblioteca de componentes.", c: "Diseño base (DS - marca blanca)" },
            { n: "2", t: "Tokens", d: "Las mismas variables, con el mismo nombre. Un comando genera el CSS.", c: "tokens/tokens.json" },
            { n: "3", t: "Componentes", d: "Construidos solo con tokens, accesibles y documentados aquí.", c: "components/ds" },
            { n: "4", t: "Producto", d: "Cada flujo importa los componentes y las recetas del sistema.", c: "app/ y components/" },
          ].map((p) => (
            <li key={p.n} className="flex flex-col gap-espacio-xs rounded-radio-l border border-borde-sutil bg-surface p-espacio-l">
              <span aria-hidden="true" className="inline-flex size-8 items-center justify-center rounded-full bg-brand-primary text-pequeno font-semibold text-brand-on-primary">
                {p.n}
              </span>
              <p className="text-tarjeta">{p.t}</p>
              <p className="text-pequeno text-text-muted">{p.d}</p>
              <p className="mt-auto pt-espacio-s font-mono text-[12px] text-text-muted">{p.c}</p>
            </li>
          ))}
        </ol>
      </Seccion>

      <Seccion id="principios" titulo="Principios">
        <ul className="grid gap-espacio-l sm:grid-cols-2">
          {PRINCIPIOS.map((p) => (
            <li key={p.t} className="border-t-2 border-fondo-inverso pt-espacio-m">
              <p className="text-tarjeta">{p.t}</p>
              <p className="mt-espacio-xs text-cuerpo text-text-muted">{p.d}</p>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion id="recorrido" titulo="Recorrido">
        <ul className="grid gap-espacio-m sm:grid-cols-2">
          {ENTRADAS.map((e) => (
            <li key={e.href}>
              <Link href={e.href} className={`group flex h-full items-start gap-espacio-m rounded-radio-l border border-borde-sutil bg-surface p-espacio-l transition-colors duration-(--duracion-rapida) hover:border-border hover:bg-fondo-sutil motion-reduce:transition-none ${FOCO}`}>
                <span aria-hidden="true" className="inline-flex size-12 shrink-0 items-center justify-center rounded-radio-m bg-fondo-sutil group-hover:bg-surface">
                  <Icono nombre={e.icono} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-tarjeta">{e.titulo}</span>
                  <span className="block text-pequeno text-text-muted">{e.texto}</span>
                </span>
                <Icono nombre="arrow-right" className="mt-1 text-text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </Seccion>
    </>
  );
}
