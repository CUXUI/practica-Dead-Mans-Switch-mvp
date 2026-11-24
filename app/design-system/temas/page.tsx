import type { Metadata } from "next";
import { TOKENS, TEMAS } from "@/lib/ds/tokens";
import { Chip, Codigo, Lienzo, Seccion, Telefono, TituloPagina } from "../_ui/piezas";
import PantallaProducto from "../_ui/Pantallas";
import SelectorTema from "../_ui/SelectorTema";
import { DemoBadges, DemoBoton } from "../_ui/Demos";

export const metadata: Metadata = { title: "Temas de marca" };
// Las pantallas de ejemplo calculan sus horas a partir de «ahora».
export const dynamic = "force-dynamic";

export default function Temas() {
  return (
    <>
      <TituloPagina titulo="Temas de marca">
        El producto es de marca blanca: una sola app que cada organización ofrece con su nombre y su color. Cambiar de marca es cambiar un token, <Chip>accion/principal</Chip>. Todo lo demás (grises, tamaños, estados) se queda igual.
      </TituloPagina>

      <Seccion id="cambiar" titulo="Cámbialo ahora" descripcion="Elige un tema. Cambia esta página y también el producto completo en este navegador: abre la app en otra pestaña y compruébalo.">
        <Lienzo className="flex flex-col items-start gap-espacio-l">
          <SelectorTema />
          <div className="grid w-full gap-espacio-xl md:grid-cols-2">
            <DemoBoton />
            <div className="flex flex-col gap-espacio-l">
              <DemoBadges />
              <p className="text-pequeno text-text-muted">Los badges, los estados y los textos no cambian con la marca: los cinco estados de una alerta se llaman y se ven igual en todas.</p>
            </div>
          </div>
        </Lienzo>
      </Seccion>

      <Seccion id="lado-a-lado" titulo="La misma pantalla, tres marcas" descripcion="Es la pantalla de Inicio real, tres veces, cada una con su tema. El mismo código, los mismos componentes.">
        <div className="-mx-espacio-l flex gap-espacio-xl overflow-x-auto px-espacio-l pb-espacio-l lg:mx-0 lg:justify-between lg:gap-espacio-m lg:overflow-visible lg:px-0">
          {TEMAS.map((t) => (
            <div key={t} className="shrink-0">
              <Telefono compacto tema={t} etiqueta={`${TOKENS.temas[t].nombre} · ${TOKENS.color["accion/principal"].valor[t]}`}>
                <PantallaProducto id={t === "montana" ? "alerta" : "activo"} />
              </Telefono>
            </div>
          ))}
        </div>
      </Seccion>

      <Seccion id="como" titulo="Cómo se suma una marca nueva" descripcion="Tres pasos, sin tocar componentes ni pantallas.">
        <ol className="flex flex-col gap-espacio-l">
          <li>
            <p className="text-etiqueta">1. En Figma, agrega un modo a la colección «Color»</p>
            <p className="text-cuerpo text-text-muted">Define accion/principal para la marca. Blanco sobre ese color debe dar al menos 4,5:1; si no llega, se usa el del tema Base.</p>
          </li>
          <li>
            <p className="text-etiqueta">2. En el código, agrega el tema a los tokens</p>
            <Codigo>{`// tokens/tokens.json
"temas": { "base": {…}, "cerca": {…}, "montana": {…}, "nueva": { "nombre": "Nueva" } },
"accion/principal": { "valor": { "base": "#262626", "cerca": "#b2102e", "montana": "#1c7c70", "nueva": "#0b57d0" } }

// y después
npm run tokens`}</Codigo>
          </li>
          <li>
            <p className="text-etiqueta">3. En el despliegue de esa marca, elige el tema</p>
            <Codigo>{`# Variables de entorno (Vercel)
NEXT_PUBLIC_TEMA=nueva     # base | cerca | montana | …
APP_VARIANT=cerca          # textos y nombre de la versión`}</Codigo>
            <p className="mt-espacio-s text-cuerpo text-text-muted">
              Para una demo sin desplegar nada, cualquier pantalla acepta <Chip>?tema=montana</Chip> en la dirección y lo recuerda en ese navegador. Con <Chip>?tema=reset</Chip> vuelve al tema del despliegue.
            </p>
          </li>
        </ol>
      </Seccion>

      <Seccion id="por-que-gris" titulo="Por qué la base es gris" descripcion="Rojo, amarillo y verde ya significan algo para la gente: error, advertencia y éxito. Si una marca usa uno de esos colores, cada botón se puede leer como una alarma o como un «todo bien».">
        <ul className="flex list-disc flex-col gap-espacio-xs pl-5 text-cuerpo text-text-muted marker:text-borde-control">
          <li>Los estados del sistema no usan color: llevan ícono y palabra. Así funcionan con cualquier marca, incluso una roja.</li>
          <li>El color de marca aparece en pocas piezas: botón principal, destino actual, interruptor encendido, opción elegida y logo.</li>
          <li>En un producto que avisa cuando alguien no responde, el tono es de calma. La base en grises lo sostiene.</li>
        </ul>
      </Seccion>
    </>
  );
}
