import { getBrand } from "@/lib/brand";
import { textosContactos } from "@/components/contactos/textos";
import FormContacto from "@/components/contactos/FormContacto";
import { avisoActual, exigirSesion } from "@/app/aviso/_datos/sesion";

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
  // Sin aviso todavía = sigue en el onboarding.
  const enAlta = !aviso;
  const cancelarHref = total > 0 ? "/contactos" : enAlta ? "/alta/notificaciones" : "/home";

  return <FormContacto t={t} enAlta={enAlta} esPrimero={total === 0} cancelarHref={cancelarHref} />;
}
