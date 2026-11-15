import { redirect } from "next/navigation";
import { getBrand } from "@/lib/brand";
import { textosContactos } from "@/components/contactos/textos";
import DetalleContacto from "@/components/contactos/DetalleContacto";
import { adaptadorExtras } from "@/app/aviso/_datos/adaptador";
import type { DatosContacto } from "@/app/aviso/_datos/tipos";
import { exigirSesion } from "@/app/aviso/_datos/sesion";

// E-16 · Detalle del contacto.
export async function generateMetadata() {
  return { title: textosContactos(getBrand().variant).detalle.titulo };
}

const dia = (iso: string) => new Date(iso).toLocaleDateString("es", { day: "numeric", month: "short" }).replace(".", "");

export default async function ContactoDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await exigirSesion();
  const t = textosContactos(getBrand().variant);

  // Todos los contactos vigentes: hace falta el número de fila, igual que en la lista.
  const { data: todos } = await s.supabase
    .from("contacts")
    .select("id, name, email, status, created_at, accepted_at, removed_at")
    .eq("issuer_id", s.user.id)
    .neq("status", "removed")
    .order("position");
  const i = (todos ?? []).findIndex((x) => x.id === id);
  if (i < 0) redirect("/contactos");
  const c = todos![i];

  const extras = await adaptadorExtras(s.supabase)
    .leerContactos(s.user.id, [c.id])
    .catch(() => ({}) as Record<string, DatosContacto>);
  const e = extras[c.id];

  // Posición dentro del aviso (el orden en que se avisa).
  const { data: aviso } = await s.supabase.from("notices").select("id").eq("issuer_id", s.user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  let orden: number | null = null;
  if (aviso) {
    const { data: filas } = await s.supabase.from("notice_contacts").select("contact_id, position").eq("notice_id", aviso.id).order("position");
    const k = (filas ?? []).findIndex((f) => f.contact_id === c.id);
    if (k >= 0) orden = k + 1;
  }

  const acepto = c.status === "accepted";
  const fechaIso = acepto ? (c.accepted_at as string | null) : (e?.invitacionEnviadaEn ?? null);

  return (
    <DetalleContacto
      t={t.detalle}
      tLista={t.lista}
      c={{
        id: c.id,
        name: c.name,
        email: c.email,
        status: c.status as "pending" | "accepted" | "rejected",
        relacion: e?.relacion ?? null,
        fecha: fechaIso ? dia(fechaIso) : null,
        enviada: !!e?.invitacionEnviadaEn,
        salio: c.status === "rejected" && !!c.removed_at,
        orden,
        numero: i + 1,
        mensaje: e?.mensajeInvitacion ?? null,
      }}
    />
  );
}
