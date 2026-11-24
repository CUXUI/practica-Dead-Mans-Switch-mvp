import Link from "next/link";
import Reenviar from "@/components/contactos/Reenviar";
import BarraNavegacion from "@/components/home/BarraNavegacion";
import type { TextosInicio } from "@/components/home/textosInicio";
import Toast from "@/components/emisor/Toast";
import RefrescarSolo from "@/components/emisor/RefrescarSolo";
import Quitar from "@/components/contactos/Quitar";
import { rellenar } from "@/components/aviso/textos";
import { Badge, Encabezado, EnlaceBoton, Numero, Pantalla, Progreso, Tarjeta, clases } from "@/components/emisor/ui";
import type { DatosContacto } from "@/app/aviso/_datos/tipos";
import type { TextosContactos } from "./textos";

// R-AV-E1 · Web Aviso · invitación enviada (alta) y E-05 · Contactos (fuera del alta).
// Solo pinta: los datos los pone la página.
export type ContactoFila = { id: string; name: string; status: string; created_at: string; removed_at?: string | null };

const dia = (iso: string) => new Date(iso).toLocaleDateString("es", { day: "numeric", month: "short" }).replace(".", "");

function Mas() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="mr-2 size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconoInfo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

function Icono({ tipo }: { tipo: "espera" | "ok" | "no" }) {
  const trazo = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" {...trazo}>
      {tipo === "ok" && <path d="M5 12l5 5 9-10" />}
      {tipo === "espera" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      )}
      {tipo === "no" && <path d="M6 6l12 12M18 6L6 18" />}
    </svg>
  );
}

export default function ListaContactos({
  t,
  nav,
  app,
  contactos,
  extras,
  enAlta,
  maximo,
  enviada,
  quitado,
  fallo,
  guardado,
  correoNuevo,
}: {
  t: TextosContactos["lista"];
  nav: TextosInicio["nav"];
  app: string;
  contactos: ContactoFila[];
  extras: Record<string, DatosContacto>;
  enAlta: boolean;
  maximo: number;
  enviada?: boolean;
  quitado?: boolean;
  fallo?: boolean;
  guardado?: boolean;
  correoNuevo?: boolean;
}) {
  const puedeAgregar = contactos.length < maximo;
  // Para continuar el alta hace falta alguien a quien poder avisar (no vale solo quien rechazó).
  const hayUtiles = contactos.some((c) => c.status === "pending" || c.status === "accepted");

  // En el alta (flujo de pasos): botones fijos abajo, sin menú.
  const pieAlta =
    enAlta && (puedeAgregar || hayUtiles) ? (
      <>
        {puedeAgregar && (
          <EnlaceBoton href="/contactos/nuevo" tipo={hayUtiles ? "secundario" : "principal"}>
            <Mas />
            {t.agregarOtro}
          </EnlaceBoton>
        )}
        {hayUtiles && <EnlaceBoton href="/aviso">{t.continuar}</EnlaceBoton>}
      </>
    ) : undefined;

  // E-05 del wireflow: con 0, 1 o 2 o más contactos cambia la tarjeta que invita a agregar.
  const unico = contactos.length === 1 ? contactos[0] : undefined;
  const tarjetaAgregar =
    contactos.length === 0
      ? { titulo: t.primeroTitulo, texto: undefined }
      : unico?.status === "rejected"
        ? { titulo: t.otraPersonaTitulo, texto: rellenar(t.otraPersonaTexto, { nombre: unico.name }) }
        : unico?.status === "accepted"
          ? { titulo: t.segundoTitulo, texto: rellenar(t.soloUnoTexto, { nombre: unico.name }), info: true }
          : unico
            ? { titulo: t.segundoTitulo, texto: rellenar(t.segundoTexto, { nombre: unico.name }) }
            : undefined;

  return (
    <Pantalla pie={enAlta ? pieAlta : undefined} nav={enAlta ? undefined : <BarraNavegacion t={nav} actual="contactos" />}>
      {enAlta ? (
        <Progreso actual={2} total={3} siguiente={t.siguiente} />
      ) : (
        <>
          <Encabezado nombre={app} />
          <h1 className="pt-2 text-seccion">{t.tituloPantalla}</h1>
        </>
      )}

      {/* Los estados (Aceptó, No aceptó) cambian desde el correo del contacto: se actualizan solos. */}
      {!enAlta && <RefrescarSolo />}
      {enviada && <Toast texto={t.enviada} quitarParametro="enviada" />}
      {quitado && <Toast texto={t.quitado} quitarParametro="quitado" />}
      {guardado && <Toast texto={t.guardado} quitarParametro="guardado" />}
      {correoNuevo && <Toast texto={t.correoNuevo} quitarParametro="correo" />}
      {fallo && (
        <p role="alert" className="rounded-lg border-2 border-danger bg-surface p-3 text-sm font-medium">
          {t.falloCorreo}
        </p>
      )}

      {(enAlta || contactos.length > 0) && (
      <Tarjeta titulo={enAlta ? t.titulo : undefined} id="tus-contactos">
        {enAlta && contactos.length === 0 && <p>{t.vacio}</p>}
        <ul className="space-y-3">
          {contactos.map((c, i) => {
            const enviadaEn = extras[c.id]?.invitacionEnviadaEn;
            const detalle = [extras[c.id]?.relacion, dia(c.created_at)].filter(Boolean).join(" · ");
            return (
              <li key={c.id} className="space-y-1 rounded-lg border border-border/50 p-3">
                <div className="flex items-center gap-3">
                  <Numero n={i + 1} />
                  <div className="min-w-0 flex-1">
                    <Link href={`/contactos/${c.id}`} className="font-semibold">{c.name}</Link>
                    <p className="text-sm text-text-muted">{detalle}</p>
                  </div>
                  <Badge>
                    <span className="inline-flex items-center gap-1">
                      <Icono tipo={c.status === "accepted" ? "ok" : c.status === "rejected" ? "no" : "espera"} />
                      {c.status === "accepted" ? t.estadoAcepto : c.status === "rejected" ? (c.removed_at ? t.estadoSalio : t.estadoNoAcepto) : t.estadoEspera}
                    </span>
                  </Badge>
                </div>
                {/* "Invitación sin enviar": no está en el wireflow, pero nunca se dice "enviada" si el correo no salió. */}
                {c.status === "pending" && !enviadaEn && <p className="text-sm font-medium text-danger">{t.noEnviada}</p>}
                {/* Decisión del 14/11: las acciones van en la lista (menos toques). "Editar" abre E-17. */}
                <div className="flex flex-wrap items-start gap-x-6">
                  <Link href={`/contactos/${c.id}/editar`} className={clases.enlace} aria-label={`${t.editar}: ${c.name}`}>
                    {t.editar}
                  </Link>
                  {c.status === "pending" && <Reenviar contactId={c.id} nombre={c.name} sinEnviar={!enviadaEn} t={t} />}
                  <Quitar contactId={c.id} nombre={c.name} estado={c.status === "pending" && !enviadaEn ? "sinEnviar" : (c.status as "pending" | "accepted" | "rejected")} t={t} />
                </div>
              </li>
            );
          })}
        </ul>
      </Tarjeta>
      )}

      {/* Con 2 o más contactos el botón va suelto bajo la lista. Con 0 o 1 va dentro de la tarjeta que invita a agregar. */}
      {!enAlta && puedeAgregar && tarjetaAgregar && (
        <section className="space-y-3 rounded-xl bg-surface p-4">
          <div className="flex items-center gap-2">
            {"info" in tarjetaAgregar && tarjetaAgregar.info && <IconoInfo />}
            <h2 className="font-semibold">{tarjetaAgregar.titulo}</h2>
          </div>
          {tarjetaAgregar.texto && <p className="text-text-muted">{tarjetaAgregar.texto}</p>}
          <EnlaceBoton href="/contactos/nuevo">
            <Mas />
            {t.agregar}
          </EnlaceBoton>
        </section>
      )}
      {!enAlta && puedeAgregar && !tarjetaAgregar && (
        <EnlaceBoton href="/contactos/nuevo">
          <Mas />
          {t.agregar}
        </EnlaceBoton>
      )}
    </Pantalla>
  );
}
