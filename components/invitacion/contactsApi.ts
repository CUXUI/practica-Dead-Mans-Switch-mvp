import { createClient } from "@/lib/supabase/client";
import type { ContactsApi, Decision, InvitationLookup, RespondResult } from "./types";

// Quien recibe no tiene cuenta. Ambas llamadas usan solo el token del enlace:
// - lectura: función get_invitation (migración 0012), que devuelve lo mínimo para mostrar la invitación.
// - respuesta: ruta /api/invitacion/responder, que llama a respond_invitation y avisa a quien emite.
export const contactsApi: ContactsApi = {
  async getInvitation(token): Promise<InvitationLookup> {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_invitation", { p_token: token });
    if (error) throw new Error("No pudimos abrir la invitación");
    const row = Array.isArray(data) ? data[0] : null;
    if (!row) return { kind: "not_found" };
    return {
      kind: "found",
      invitation: {
        issuerName: row.issuer_name ?? "",
        contactEmail: row.contact_email,
        status: row.status,
      },
    };
  },

  async respond(token: string, decision: Decision): Promise<RespondResult> {
    const res = await fetch("/api/invitacion/responder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, decision }),
    });
    if (!res.ok) throw new Error("No pudimos registrar tu respuesta");
    return (await res.json()) as RespondResult;
  },
};
