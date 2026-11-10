// Solo servidor. No importar desde un componente "use client".
import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;
import type { AdaptadorExtras, DatosContacto } from "./tipos";

// Adaptador definitivo. Usa las tablas pedidas al núcleo (todavía NO existen):
//   notice_extras   (notice_id, issuer_id, message, weekdays)
//   notice_steps    (notice_id, issuer_id, position, body)
//   contact_details (contact_id, issuer_id, relationship, invite_sent_at)
// Se activa cambiando `adaptadorExtras` a "supabase" en config.ts.
// Si el núcleo elige otros nombres de tabla o columna, solo se cambia este archivo.
export function crearAdaptadorSupabase(supabase: SupabaseClient): AdaptadorExtras {
  return {
    async leerAviso(issuerId, noticeId) {
      const [{ data: extra, error: e1 }, { data: pasos, error: e2 }] = await Promise.all([
        supabase
          .from("notice_extras")
          .select("message, weekdays")
          .eq("notice_id", noticeId)
          .eq("issuer_id", issuerId)
          .maybeSingle(),
        supabase
          .from("notice_steps")
          .select("body, position")
          .eq("notice_id", noticeId)
          .eq("issuer_id", issuerId)
          .order("position"),
      ]);
      if (e1 || e2) throw new Error("No se pudieron leer los datos del aviso");
      if (!extra && (pasos?.length ?? 0) === 0) return null;
      return {
        mensaje: (extra?.message as string | null) ?? "",
        dias: (extra?.weekdays as number[] | null) ?? [],
        pasos: (pasos ?? []).map((p) => p.body as string),
      };
    },

    async guardarAviso(issuerId, noticeId, extras) {
      const { error: e1 } = await supabase.from("notice_extras").upsert(
        {
          notice_id: noticeId,
          issuer_id: issuerId,
          message: extras.mensaje || null,
          weekdays: extras.dias.length ? extras.dias : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "notice_id" }
      );
      if (e1) throw new Error("No se pudo guardar el mensaje del aviso");

      const { error: e2 } = await supabase
        .from("notice_steps")
        .delete()
        .eq("notice_id", noticeId)
        .eq("issuer_id", issuerId);
      if (e2) throw new Error("No se pudieron actualizar los pasos");

      if (extras.pasos.length) {
        const { error: e3 } = await supabase.from("notice_steps").insert(
          extras.pasos.map((body, i) => ({
            notice_id: noticeId,
            issuer_id: issuerId,
            position: i + 1,
            body,
          }))
        );
        if (e3) throw new Error("No se pudieron guardar los pasos");
      }
    },

    async leerContactos(issuerId, contactIds) {
      if (!contactIds.length) return {};
      const { data, error } = await supabase
        .from("contact_details")
        .select("contact_id, relationship, invite_sent_at")
        .eq("issuer_id", issuerId)
        .in("contact_id", contactIds);
      if (error) throw new Error("No se pudieron leer los datos de los contactos");
      const out: Record<string, DatosContacto> = {};
      for (const r of data ?? [])
        out[r.contact_id as string] = {
          relacion: (r.relationship as string | null) ?? null,
          invitacionEnviadaEn: (r.invite_sent_at as string | null) ?? null,
        };
      return out;
    },

    async guardarRelacion(issuerId, contactId, relacion) {
      const { error } = await supabase
        .from("contact_details")
        .upsert({ contact_id: contactId, issuer_id: issuerId, relationship: relacion }, { onConflict: "contact_id" });
      if (error) throw new Error("No se pudo guardar la relación");
    },

    async marcarInvitacion(issuerId, contactId, enviadaEn) {
      const { error } = await supabase
        .from("contact_details")
        .upsert({ contact_id: contactId, issuer_id: issuerId, invite_sent_at: enviadaEn }, { onConflict: "contact_id" });
      if (error) throw new Error("No se pudo guardar el envío de la invitación");
    },
  };
}
