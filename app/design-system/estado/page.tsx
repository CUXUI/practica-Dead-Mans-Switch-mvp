import type { Metadata } from "next";
import { Badge } from "@/components/ds/Contenido";
import { COBERTURA, PENDIENTES, type Estado } from "../_datos/cobertura";
import { ARCHIVO_FIGMA, Chip, Codigo, EnlaceExterno, REPO, Seccion, TituloPagina, enFigma } from "../_ui/piezas";

export const metadata: Metadata = { title: "Estado y enlaces" };

const ETIQUETA: Record<Estado, { texto: string; tipo: "exito" | "oscuro" | "claro" | "etiqueta" }> = {
  sistema: { texto: "En el sistema", tipo: "exito" },
  producto: { texto: "En el producto", tipo: "claro" },
  figma: { texto: "Solo en Figma", tipo: "oscuro" },
  maqueta: { texto: "Maqueta", tipo: "etiqueta" },
};

export default function EstadoDS() {
  const cuenta = (e: Estado) => COBERTURA.filter((f) => f.estado === e).length;
  const construidos = cuenta("sistema") + cuenta("producto");
  const total = COBERTURA.length - cuenta("maqueta");
  const secciones = Array.from(new Set(COBERTURA.map((f) => f.seccion)));

  return (
    <>
      <TituloPagina titulo="Estado y enlaces">
        Qué está diseñado, qué está construido y dónde vive cada cosa. Una fila por componente de la Biblioteca de Figma, con su enlace al diseño y su archivo en el código.
      </TituloPagina>

      <Seccion id="resumen" titulo="Resumen">
        <dl className="grid gap-espacio-m sm:grid-cols-2 lg:grid-cols-4">
          {[
            { n: `${construidos} de ${total}`, t: "componentes de Figma construidos" },
            { n: String(cuenta("sistema")), t: "en el sistema, listos para reutilizar" },
            { n: String(cuenta("producto")), t: "dentro de un flujo del producto" },
            { n: String(cuenta("figma")), t: "diseñados y sin construir" },
          ].map((d) => (
            <div key={d.t} className="rounded-radio-l border border-borde-sutil bg-surface p-espacio-l">
              <dd className="text-pantalla tabular-nums">{d.n}</dd>
              <dt className="text-pequeno text-text-muted">{d.t}</dt>
            </div>
          ))}
        </dl>
      </Seccion>

      <Seccion id="fuentes" titulo="Dónde vive cada cosa" descripcion="Una sola fuente por tema. Si dos lugares dicen cosas distintas, gana el de esta lista.">
        <ul className="grid gap-espacio-m md:grid-cols-2">
          {[
            { t: "Diseño", d: "Archivo «Diseño base (DS - marca blanca)», página de componentes. Biblioteca ordenada en secciones 00 a 10.", e: <EnlaceExterno href={enFigma("3732:29014")}>Biblioteca en Figma</EnlaceExterno> },
            { t: "Tokens", d: "Variables de Figma, copiadas con el mismo nombre en tokens/tokens.json. De ahí sale app/tokens.css.", e: <EnlaceExterno href={`${REPO}/tree/feature-design-system/tokens`}>Tokens en GitHub</EnlaceExterno> },
            { t: "Componentes", d: "Carpeta components/ds. Las recetas de clases están en estilos.ts.", e: <EnlaceExterno href={`${REPO}/tree/feature-design-system/components/ds`}>Componentes en GitHub</EnlaceExterno> },
            { t: "Documentación", d: "Este sitio. Vive dentro de la app, en /design-system, y usa los componentes reales.", e: <EnlaceExterno href={ARCHIVO_FIGMA}>Archivo de Figma completo</EnlaceExterno> },
          ].map((f) => (
            <li key={f.t} className="rounded-radio-l border border-borde-sutil bg-surface p-espacio-l">
              <p className="text-etiqueta">{f.t}</p>
              <p className="text-pequeno text-text-muted">{f.d}</p>
              {f.e}
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion id="cobertura" titulo="Figma ↔ código" descripcion="«En el sistema»: componente reutilizable en components/ds. «En el producto»: construido dentro de un flujo, con los tokens del sistema. «Solo en Figma»: diseñado, todavía sin construir.">
        <div className="flex flex-col gap-espacio-xl">
          {secciones.map((s) => (
            <div key={s} className="overflow-x-auto rounded-radio-l border border-borde-sutil bg-surface">
              <table className="w-full min-w-[40rem] text-left text-pequeno">
                <caption className="border-b border-borde-sutil p-espacio-m text-left text-etiqueta">{s}</caption>
                <thead className="sr-only">
                  <tr>
                    <th scope="col">Componente</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Código</th>
                    <th scope="col">Figma</th>
                  </tr>
                </thead>
                <tbody>
                  {COBERTURA.filter((f) => f.seccion === s).map((f) => (
                    <tr key={f.nombre} className="border-b border-borde-sutil last:border-0">
                      <th scope="row" className="w-[34%] p-espacio-m align-middle font-semibold">{f.nombre}</th>
                      <td className="w-[20%] p-espacio-m align-middle">
                        <Badge tipo={ETIQUETA[f.estado].tipo}>{ETIQUETA[f.estado].texto}</Badge>
                      </td>
                      <td className="p-espacio-m align-middle">{f.codigo ? <span className="break-words font-mono text-[12px] text-text-muted">{f.codigo}</span> : <span className="text-text-muted">Sin construir</span>}</td>
                      <td className="w-24 p-espacio-m align-middle">
                        <a href={enFigma(f.figma)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4 hover:decoration-2 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-foco-anillo">
                          Figma<span className="sr-only">: {f.nombre} (se abre en otra pestaña)</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </Seccion>

      <Seccion id="pendientes" titulo="Pendientes para alinear" descripcion="Diferencias encontradas al pasar el sistema a código. Ninguna impide usarlo; cerrarlas deja diseño y código diciendo lo mismo.">
        <ul className="flex flex-col gap-espacio-m">
          {PENDIENTES.map((p) => (
            <li key={p.titulo} className="rounded-radio-l border border-borde-sutil bg-surface p-espacio-l">
              <Badge tipo="etiqueta">{p.quien}</Badge>
              <p className="mt-espacio-xs text-etiqueta">{p.titulo}</p>
              <p className="text-cuerpo text-text-muted">{p.detalle}</p>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion id="contribuir" titulo="Cómo se cambia el sistema" descripcion="El orden importa: primero el diseño, después el token o el componente, al final el producto.">
        <ol className="flex list-decimal flex-col gap-espacio-s pl-5 text-cuerpo text-text-muted marker:font-semibold marker:text-text">
          <li>El cambio se hace en Figma, en la Biblioteca, y se avisa en el hilo «Design System».</li>
          <li>
            Si es un token: se edita <Chip>tokens/tokens.json</Chip> y se corre <Chip>npm run tokens</Chip>. Nunca se edita <Chip>app/tokens.css</Chip> a mano.
          </li>
          <li>
            Si es un componente: se edita en <Chip>components/ds</Chip> y se actualiza su ficha en esta documentación y su fila en la tabla de arriba.
          </li>
          <li>Rama propia y Pull Request, como cualquier cambio. La vista previa de Vercel muestra el producto y esta documentación con el cambio aplicado.</li>
          <li>Se revisa en los tres temas, con teclado y con zoom al 200 %.</li>
        </ol>
        <div className="mt-espacio-l">
          <Codigo>{`# Regenerar los tokens después de cambiar tokens/tokens.json
npm run tokens

# Ver el producto con otro tema, sin desplegar
/home?tema=montana     # base | cerca | montana | reset`}</Codigo>
        </div>
      </Seccion>
    </>
  );
}
