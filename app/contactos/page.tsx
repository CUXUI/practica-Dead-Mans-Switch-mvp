import { getBrand } from "@/lib/brand";
import { textosContactos } from "@/components/contactos/textos";
import ListaContactos from "@/components/contactos/ListaContactos";
import { textosInicio } from "@/components/home/textosInicio";
import { CONFIG_EMISOR } from "@/app/aviso/_datos/config";
import { adaptadorExtras } from "@/app/aviso/_datos/adaptador";
import type { DatosContacto } from "@/app/aviso/_datos/tipos";
import { avisoActual, exigirSesion } from "@/app/aviso/_datos/sesion";

// R-AV-E1 · Web Aviso · invitación enviada (alta) y E-05 · Contactos (fuera del alta).
export async function generateMetadata() {
  return { title: textosContactos(getBrand().variant).lista.titulo };
}

export default async function Contactos({
  searchParams,
}: {
  searchParams: Promise<{ enviada?: string; fallo?: string; quitado?: string; guardado?: string; correo?: string }>;
}) {
  const { enviada, fallo, quitado, guardado, correo } = await searchParams;
  const s = await exigirSesion();
  const marca = getBrand();

  const [{ data }, aviso] = await Promise.all([
    s.supabase
      .from("contacts")
      .select("id, name, status, created_at, accepted_at, removed_at")
      .eq("issuer_id", s.user.id)
      .neq("status", "removed")
      .order("position"),
    avisoActual(s),
  ]);
  const contactos = data ?? [];
  const extras = await adaptadorExtras(s.supabase)
    .leerContactos(s.user.id, contactos.map((c) => c.id))
    .catch(() => ({}) as Record<string, DatosContacto>);

  return (
    <ListaContactos
      t={textosContactos(marca.variant).lista}
      nav={textosInicio(marca.variant).nav}
      app={marca.name}
      contactos={contactos}
      extras={extras}
      enAlta={!aviso}
      maximo={CONFIG_EMISOR.contactosMax}
      enviada={!!enviada}
      quitado={!!quitado}
      fallo={!!fallo}
      guardado={!!guardado}
      correoNuevo={!!correo}
    />
  );
}
