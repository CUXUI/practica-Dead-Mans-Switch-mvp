import { redirect } from "next/navigation";
import { getBrand } from "@/lib/brand";
import { textosContactos } from "@/components/contactos/textos";
import EditarContacto from "@/components/contactos/EditarContacto";
import { adaptadorExtras } from "@/app/aviso/_datos/adaptador";
import { primerNombre } from "@/app/aviso/_datos/formato";
import type { DatosContacto } from "@/app/aviso/_datos/tipos";
import { exigirSesion } from "@/app/aviso/_datos/sesion";

// E-17 · Editar contacto.
export async function generateMetadata() {
  return { title: textosContactos(getBrand().variant).editar.titulo };
}

export default async function ContactoEditar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await exigirSesion();
  const t = textosContactos(getBrand().variant);

  const { data: c } = await s.supabase
    .from("contacts")
    .select("id, name, email, status")
    .eq("id", id)
    .eq("issuer_id", s.user.id)
    .neq("status", "removed")
    .maybeSingle();
  if (!c) redirect("/contactos");

  const extras = await adaptadorExtras(s.supabase)
    .leerContactos(s.user.id, [c.id])
    .catch(() => ({}) as Record<string, DatosContacto>);

  // ¿Es la única persona que aceptó dentro de un aviso encendido? Entonces cambiar su correo lo apaga.
  let apagaAviso = false;
  if (c.status === "accepted") {
    const { data: activos } = await s.supabase.from("notices").select("id").eq("issuer_id", s.user.id).eq("state", "active");
    for (const aviso of activos ?? []) {
      const { data: filas } = await s.supabase.from("notice_contacts").select("contact_id, contacts(status)").eq("notice_id", aviso.id);
      const aceptados = (filas ?? []).filter((f) => {
        const x = (Array.isArray(f.contacts) ? f.contacts[0] : f.contacts) as { status: string } | null;
        return x?.status === "accepted";
      });
      if (aceptados.length === 1 && aceptados[0].contact_id === c.id) apagaAviso = true;
    }
  }

  return (
    <EditarContacto
      t={t.editar}
      tNuevo={t.nuevo}
      contacto={{ id: c.id, name: c.name, email: c.email, relacion: extras[c.id]?.relacion ?? "", primerNombre: primerNombre(c.name) }}
      apagaAviso={apagaAviso}
      acepto={c.status === "accepted"}
    />
  );
}
