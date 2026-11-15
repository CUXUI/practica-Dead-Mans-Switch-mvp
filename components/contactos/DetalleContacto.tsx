import Reenviar from "@/components/contactos/Reenviar";
import Quitar from "@/components/contactos/Quitar";
import { Badge, BarraTitulo, EnlaceBoton, Numero, Pantalla, Tarjeta } from "@/components/emisor/ui";
import type { TextosContactos } from "./textos";

// E-16 · Detalle del contacto. Solo pinta: los datos los pone la página.
// Acepto: "Editar contacto". En espera o No aceptó: "Reenviar invitación". Quitar va debajo.
export type FilaDetalle = {
  id: string;
  name: string;
  email: string;
  status: "pending" | "accepted" | "rejected";
  relacion: string | null;
  // Fecha ya formateada ("3 nov"): aceptó o salió la invitación. null si no hay.
  fecha: string | null;
  enviada: boolean;
  // Se dio de baja desde su correo.
  salio?: boolean;
  // Posición dentro del aviso (1 a 5) o null si no está.
  orden: number | null;
  numero: number;
  mensaje: string | null;
};

export default function DetalleContacto({
  t,
  tLista,
  c,
}: {
  t: TextosContactos["detalle"];
  tLista: TextosContactos["lista"];
  c: FilaDetalle;
}) {
  const acepto = c.status === "accepted";
  const rechazo = c.status === "rejected";
  const etiquetaFecha = acepto ? t.aceptoEl : c.enviada ? t.invitacionEnviada : t.sinEnviar;
  const estado = acepto ? tLista.estadoAcepto : rechazo ? (c.salio ? tLista.estadoSalio : tLista.estadoNoAcepto) : tLista.estadoEspera;
  const orden = c.orden ? t.orden[c.orden - 1] : t.sinOrden;

  const filas: [string, string][] = [];
  if (!rechazo) filas.push([etiquetaFecha, c.fecha ?? ""]);
  filas.push([t.correo, c.email], [t.ordenAviso, orden]);
  if (!acepto) filas.push([t.mensaje, c.mensaje ?? t.general]);

  return (
    <Pantalla>
      <BarraTitulo titulo={t.titulo} volverHref="/contactos" />
      <Tarjeta>
        <div className="flex items-center gap-3">
          <Numero n={c.numero} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{c.name}</p>
            <p className="text-sm text-text-muted">{rechazo ? (c.salio ? t.salioSub : t.noRecibira) : c.relacion ?? ""}</p>
          </div>
          <Badge>{estado}</Badge>
        </div>
        <dl className="space-y-2">
          {filas.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4">
              <dt className="text-text-muted">{k}</dt>
              <dd className="min-w-0 break-words text-right font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </Tarjeta>
      <div className="space-y-2">
        {acepto ? (
          <EnlaceBoton href={`/contactos/${c.id}/editar`}>
            {t.editarContacto}
          </EnlaceBoton>
        ) : rechazo ? null : (
          // Quien no aceptó (rechazó) no recibe más invitaciones: aquí no se ofrece reenviar.
          <Reenviar contactId={c.id} nombre={c.name} sinEnviar={!c.enviada} t={tLista} comoBoton />
        )}
        <Quitar
          contactId={c.id}
          nombre={c.name}
          estado={c.status === "pending" && !c.enviada ? "sinEnviar" : c.status}
          t={{ ...tLista, quitar: c.status === "pending" ? t.quitarInvitacion : t.quitarContacto }}
        />
      </div>
    </Pantalla>
  );
}
