import { redirect } from "next/navigation";
import { getBrand } from "@/lib/brand";
import { textosAviso } from "@/components/aviso/textos";
import ConfigurarAviso, { type ContactoOpcion, type Inicial } from "@/components/aviso/ConfigurarAviso";
import { CONFIG_EMISOR, configVersion } from "./_datos/config";
import { adaptadorExtras } from "./_datos/adaptador";
import { avisoActual, exigirSesion } from "./_datos/sesion";
import type { DatosContacto, Frecuencia } from "./_datos/tipos";

// E · Configurar aviso (Hora, Pasos, Contactos) + Resumen + Guardando.
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
  const extras = adaptadorExtras(s.supabase);
  const datosContactos = await extras
    .leerContactos(s.user.id, contactos.map((c) => c.id))
    .catch(() => ({}) as Record<string, DatosContacto>);

  const opciones: ContactoOpcion[] = contactos.map((c) => ({
    id: c.id,
    name: c.name,
    accepted: c.status === "accepted",
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
    mensaje: datos?.mensaje ?? "",
    pasos: datos?.pasos?.length ? datos.pasos : cfg.pasosObligatorios ? [""] : [],
    contactos: enAviso,
  };

  return (
    <ConfigurarAviso
      t={textosAviso(brand.variant)}
      inicial={inicial}
      opciones={opciones}
      pasosObligatorios={cfg.pasosObligatorios}
      limites={{
        graciaOpciones: CONFIG_EMISOR.gracia.opciones,
        graciaMin: CONFIG_EMISOR.gracia.minimoMin,
        graciaMax: CONFIG_EMISOR.gracia.maximoMin,
        mensajeMax: CONFIG_EMISOR.mensajeMax,
        pasoMax: CONFIG_EMISOR.pasoMax,
        pasosMax: CONFIG_EMISOR.pasosMax,
      }}
      volverHref={aviso ? "/home" : "/contactos"}
    />
  );
}
