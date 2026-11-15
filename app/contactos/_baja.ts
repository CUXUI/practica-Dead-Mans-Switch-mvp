import type { SupabaseClient } from "@supabase/supabase-js";
import { cancelarProgramado } from "@/app/aviso/_datos/qstash";

// Solo servidor. Cuando un contacto deja de serlo (lo quita quien emite o se da de baja):
//  1. sale de los avisos donde estaba;
//  2. si un aviso encendido se queda sin ningún contacto aceptado, se apaga solo (PRD 23/10).
export async function sacarDeAvisos(db: SupabaseClient, issuerId: string, contactId: string) {
  const { error } = await db.from("notice_contacts").delete().eq("contact_id", contactId);
  if (error) console.error("[contactos] no se pudo sacar del aviso:", error.message);
  await apagarSinAceptados(db, issuerId);
}

// Apaga los avisos encendidos que ya no tienen ningún contacto aceptado y borra su disparo programado.
// También sirve cuando un contacto aceptado vuelve a "en espera" porque le cambiaron el correo.
export async function apagarSinAceptados(db: SupabaseClient, issuerId: string) {
  const { data: activos } = await db.from("notices").select("id, qstash_message_id").eq("issuer_id", issuerId).eq("state", "active");
  for (const aviso of activos ?? []) {
    const { data: filas } = await db.from("notice_contacts").select("contacts(status)").eq("notice_id", aviso.id);
    const quedaAceptado = (filas ?? []).some((f) => {
      const c = (Array.isArray(f.contacts) ? f.contacts[0] : f.contacts) as { status: string } | null;
      return c?.status === "accepted";
    });
    if (!quedaAceptado) {
      const { error: e } = await db
        .from("notices")
        .update({ state: "off", qstash_message_id: null, updated_at: new Date().toISOString() })
        .eq("id", aviso.id);
      if (e) console.error("[contactos] no se pudo apagar el aviso sin contactos:", e.message);
      else await cancelarProgramado(aviso.qstash_message_id as string | null);
    }
  }
}
