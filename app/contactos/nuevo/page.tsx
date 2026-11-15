import { redirect } from "next/navigation";
import { getBrand } from "@/lib/brand";
import { CONFIG_EMISOR } from "@/app/aviso/_datos/config";
import { textosContactos } from "@/components/contactos/textos";
import FormContacto from "@/components/contactos/FormContacto";
import { avisoActual, exigirSesion } from "@/app/aviso/_datos/sesion";

export async function generateMetadata() {
  return { title: textosContactos(getBrand().variant).nuevo.tituloFuera };
}

export default async function ContactoNuevo() {
  const s = await exigirSesion();
  const t = textosContactos(getBrand().variant).nuevo;
  const [{ count }, aviso] = await Promise.all([
    s.supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("issuer_id", s.user.id)
      .neq("status", "removed"),
    avisoActual(s),
  ]);
  const total = count ?? 0;
  if (total >= CONFIG_EMISOR.contactosMax) redirect("/contactos");
  // Sin aviso todavía = sigue en el onboarding.
  const enAlta = !aviso;
  // CONEXIÓN · Alta (Sarah): en el alta, "Cancelar" del primer contacto vuelve a /alta/notificaciones,
  // la pantalla anterior del alta. Esa ruta no va en este PR.
  const cancelarHref = total > 0 ? "/contactos" : enAlta ? "/alta/notificaciones" : "/home";

  return <FormContacto t={t} enAlta={enAlta} esPrimero={total === 0} cancelarHref={cancelarHref} />;
}
