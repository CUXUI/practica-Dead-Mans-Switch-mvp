import { redirect } from "next/navigation";
import { getBrand } from "@/lib/brand";
import { textosAviso } from "@/components/aviso/textos";
import ConfigurarAviso, { type ContactoOpcion, type Inicial } from "@/components/aviso/ConfigurarAviso";
import { CONFIG_EMISOR, configVersion } from "./_datos/config";
import { adaptadorExtras } from "./_datos/adaptador";
import { avisoActual, exigirSesion } from "./_datos/sesion";
import { primerNombre } from "./_datos/formato";
import type { DatosContacto, Frecuencia } from "./_datos/tipos";

// E · Configurar aviso (Hora, Contactos) + Resumen + Guardando.
export async function generateMetadata() {
  return { title: textosAviso(getBrand().variant).titulo };
}

export default async function Aviso() {
  const s = await exigirSesion();
  const brand = getBrand();
  const cfg = configVersion(brand.variant);
  const aviso = await avisoActual(s);

  // El aviso solo se edita apagado (decisión del 23/10).
  if (aviso && aviso.state !== "off") redirect("/home");

  const { data: filas } = await s.supabase
    .from("contacts")
    .select("id, name, status, position")
    .eq("issuer_id", s.user.id)
    .in("status", ["pending", "accepted"])
    .order("position");
  const contactos = filas ?? [];
  // Quienes se dieron de baja desde su correo siguen apareciendo: se dice que se fueron.
  const { data: salidas } = await s.supabase
    .from("contacts")
    .select("name")
    .eq("issuer_id", s.user.id)
    .eq("status", "rejected")
    .not("removed_at", "is", null)
    .order("position");
  const extras = adaptadorExtras(s.supabase);
  const datosContactos = await extras
    .leerContactos(s.user.id, contactos.map((c) => c.id))
    .catch(() => ({}) as Record<string, DatosContacto>);

  const opciones: ContactoOpcion[] = contactos.map((c) => ({
    id: c.id,
    name: c.name,
    accepted: c.status === "accepted",
    enviada: !!datosContactos[c.id]?.invitacionEnviadaEn,
    relacion: datosContactos[c.id]?.relacion ?? null,
  }));

  let enAviso = opciones.map((c) => c.id);
  let datos = null;
  if (aviso) {
    const [{ data: nc }, ex] = await Promise.all([
      s.supabase.from("notice_contacts").select("contact_id, position").eq("notice_id", aviso.id).order("position"),
      extras.leerAviso(s.user.id, aviso.id).catch(() => null),
    ]);
    const validos = new Set(enAviso);
    if (nc && nc.length) enAviso = nc.map((r) => r.contact_id as string).filter((id) => validos.has(id));
    datos = ex;
  }

  const inicial: Inicial = {
    fireAt: aviso?.fire_at ?? null,
    horaPorDefecto: cfg.horaPorDefecto,
    frecuencia: ((aviso?.recurrence as Frecuencia | undefined) ?? "once"),
    dias: datos?.dias ?? [],
    graciaMin: aviso?.grace_minutes ?? cfg.graciaPorDefecto,
    escalaMin: (aviso?.escalation_minutes as number | undefined) ?? CONFIG_EMISOR.escalado.porDefecto,
    mensaje: datos?.mensaje ?? "",
    contactos: enAviso,
  };

  return (
    <ConfigurarAviso
      t={textosAviso(brand.variant)}
      inicial={inicial}
      opciones={opciones}
      salieron={(salidas ?? []).map((c) => primerNombre(c.name as string))}
      limites={{
        graciaOpciones: CONFIG_EMISOR.gracia.opciones,
        graciaMin: CONFIG_EMISOR.gracia.minimoMin,
        graciaMax: CONFIG_EMISOR.gracia.maximoMin,
        escalaOpciones: CONFIG_EMISOR.escalado.opciones,
        mensajeMax: CONFIG_EMISOR.mensajeMax,
      }}
      volverHref={aviso ? "/home" : "/contactos"}
      enAlta={!aviso}
    />
  );
}
