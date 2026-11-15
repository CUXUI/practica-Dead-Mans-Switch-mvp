import type { ContactsApi, InvitationView } from "./types";

// PROVISORIO. Datos ficticios en memoria para probar el flujo en la vista previa.
// Tokens de prueba: demo-valida, demo-aceptada, demo-vencida.
// TODO (núcleo): reemplazar por el adaptador real que llame a la función del núcleo que valida
// el token (`contacts.invite_token_hash`) y notifica a quien emite. Hoy esa función no existe
// en /supabase/migrations: queda como "Pregunta abierta" en el PR.

const store: Record<string, InvitationView> = {
  "demo-valida": { issuerName: "Mariana", contactEmail: "ana@ejemplo.com", status: "pending" },
  "demo-aceptada": { issuerName: "Mariana", contactEmail: "ana@ejemplo.com", status: "accepted" },
  "demo-vencida": { issuerName: "Mariana", contactEmail: "ana@ejemplo.com", status: "expired" },
};

const wait = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export const contactsApi: ContactsApi = {
  async getInvitation(token) {
    await wait();
    const invitation = store[token];
    return invitation ? { kind: "found", invitation: { ...invitation } } : { kind: "not_found" };
  },
  async respond(token, decision) {
    await wait();
    const invitation = store[token];
    if (!invitation || invitation.status !== "pending") return { kind: "inactive" };
    const status = decision === "accept" ? "accepted" : "rejected";
    store[token] = { ...invitation, status };
    return { kind: "ok", status };
  },
};
