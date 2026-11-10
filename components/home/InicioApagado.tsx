import Link from "next/link";
import { Badge, EnlaceBoton, Tarjeta, clases } from "@/components/emisor/ui";
import { listaNombres } from "@/app/aviso/_datos/formato";
import { rellenar } from "@/components/aviso/textos";
import BarraNavegacion from "./BarraNavegacion";
import type { TextosInicio } from "./textosInicio";

// E · Inicio · Esperando contactos (aviso apagado, ningún contacto del aviso aceptó).
// Si ya hay un contacto aceptado, el aviso sigue apagado pero se puede encender: esa pantalla
// ("Inicio con su aviso apagado") es de otra portada y aquí solo se muestra la tarjeta base.
export default function InicioApagado({
  t,
  app,
  nombre,
  pendientes,
  hayAceptado,
}: {
  t: TextosInicio;
  app: string;
  nombre: string;
  pendientes: string[];
  hayAceptado: boolean;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-surface-muted">
      <main className="flex-1 space-y-4 p-4">
        <p className="pt-2 text-lg font-semibold">{app}</p>
        <h1 className="text-2xl font-semibold">{nombre ? rellenar(t.hola, { nombre }) : t.holaSinNombre}</h1>
        <Tarjeta
          accion={
            <Link href="/aviso" className={clases.enlace} aria-label={t.editarAria}>
              {t.editar}
            </Link>
          }
        >
          <Badge>{hayAceptado ? t.apagado : t.esperando}</Badge>
          <h2 className="text-lg font-semibold">{t.tuAviso}</h2>
          {!hayAceptado && (
            <p className="text-text-muted">
              {t.podras}{" "}
              {pendientes.length > 0 &&
                rellenar(pendientes.length === 1 ? t.aunNoUno : t.aunNoVarios, { nombres: listaNombres(pendientes) })}
            </p>
          )}
          <EnlaceBoton href="/contactos" tipo="secundario">
            {t.verContactos}
          </EnlaceBoton>
        </Tarjeta>
      </main>
      <BarraNavegacion t={t.nav} actual="inicio" />
    </div>
  );
}
