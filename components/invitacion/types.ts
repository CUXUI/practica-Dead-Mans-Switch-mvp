export type InvitationStatus = "pending" | "accepted" | "rejected" | "expired" | "cancelled";

/** Lo único que la pantalla necesita saber de la invitación. Nunca incluye el token ni su hash. */
export type InvitationView = {
  issuerName: string; // quien emite
  contactEmail: string; // quien recibe
  status: InvitationStatus;
};

export type InvitationLookup =
  | { kind: "found"; invitation: InvitationView }
  | { kind: "not_found" };

export type Decision = "accept" | "reject";

export type RespondResult =
  | { kind: "ok"; status: "accepted" | "rejected" }
  | { kind: "inactive" }; // venció, la cancelaron o ya se respondió

/**
 * Contrato con el núcleo. Quien recibe NO accede a tablas: se usa una función del núcleo
 * que valida el token contra `contacts.invite_token_hash` (AGENTS.md sección 6).
 * Si no hay red, las funciones lanzan error y la pantalla ofrece reintentar.
 */
export type ContactsApi = {
  getInvitation(token: string): Promise<InvitationLookup>;
  respond(token: string, decision: Decision): Promise<RespondResult>;
};
