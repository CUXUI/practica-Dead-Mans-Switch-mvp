import type { Metadata } from "next";
import { Chip, Seccion, Telefono, TituloPagina } from "../_ui/piezas";
import PantallaProducto, { PANTALLAS } from "../_ui/Pantallas";

export const metadata: Metadata = { title: "En el producto" };
export const dynamic = "force-dynamic";

const USO: { pieza: string; donde: string }[] = [
  { pieza: "Action Button (recetas boton.principal y boton.secundario)", donde: "Todos los flujos: alta, inicio, aviso, contactos, cuenta, invitación, baja, alerta y landing" },
  { pieza: "Barra de navegación", donde: "Inicio, Contactos, Historial y Ajustes" },
  { pieza: "Encabezado y Marca de la app", donde: "Pantallas principales, baja y landing" },
  { pieza: "Barra de título y Stepper", donde: "Configurar aviso, contactos y alta" },
  { pieza: "Card (Contorno)", donde: "Tarjetas de aviso, de alerta, de contactos, de cuenta y de invitación" },
  { pieza: "Badge", donde: "Estado del aviso y de la alerta en Inicio; estado de la invitación en Contactos" },
  { pieza: "Campo de texto (receta campo.control)", donde: "Registro, inicio de sesión, recuperar contraseña y contactos" },
  { pieza: "Toast", donde: "Confirmaciones de Inicio y Contactos" },
  { pieza: "Botón para mantener presionado", donde: "Cancelar una alerta y eliminar la cuenta" },
  { pieza: "Tokens de color, tipografía, radio y foco", donde: "Toda la app, desde app/tokens.css" },
];

export default function Producto() {
  return (
    <>
      <TituloPagina titulo="En el producto">
        El design system no es un archivo aparte: es lo que el producto usa. Estas son pantallas reales, con los mismos componentes que ven las personas, cargadas con datos de ejemplo.
      </TituloPagina>

      <Seccion id="pantallas" titulo="Pantallas reales" descripcion="Son vistas previas: no se pueden operar para que nadie guarde datos por accidente. Cambia el tema arriba y míralas cambiar.">
        <div className="-mx-espacio-l flex gap-espacio-xl overflow-x-auto px-espacio-l pb-espacio-l">
          {PANTALLAS.map((p) => (
            <div key={p.id} className="shrink-0">
              <Telefono etiqueta={`${p.nombre} · ${p.ruta}`}>
                <PantallaProducto id={p.id} />
              </Telefono>
            </div>
          ))}
        </div>
      </Seccion>

      <Seccion id="donde" titulo="Qué pieza se usa dónde" descripcion="Cada flujo importa las recetas y los componentes del sistema. Si cambia el sistema, cambian todos a la vez.">
        <div className="overflow-x-auto rounded-radio-l border border-borde-sutil bg-surface">
          <table className="w-full min-w-[32rem] text-left text-pequeno">
            <caption className="sr-only">Piezas del design system y pantallas donde se usan</caption>
            <thead>
              <tr className="border-b border-borde-sutil text-text-muted">
                <th scope="col" className="p-espacio-m font-semibold">Pieza del sistema</th>
                <th scope="col" className="p-espacio-m font-semibold">Dónde se usa</th>
              </tr>
            </thead>
            <tbody>
              {USO.map((u) => (
                <tr key={u.pieza} className="border-b border-borde-sutil last:border-0">
                  <th scope="row" className="p-espacio-m align-top font-semibold">{u.pieza}</th>
                  <td className="p-espacio-m text-text-muted">{u.donde}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-espacio-m text-pequeno text-text-muted">
          Las recetas viven en <Chip>components/ds/estilos.ts</Chip>. Los archivos <Chip>components/emisor/ui.tsx</Chip>, <Chip>components/cuenta/estilos.ts</Chip>, <Chip>components/invitacion/ui.tsx</Chip>, <Chip>components/baja/ui.tsx</Chip> y <Chip>components/landing/ui.tsx</Chip> ahora solo las reexportan.
        </p>
      </Seccion>
    </>
  );
}
