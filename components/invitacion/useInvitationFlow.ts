"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { contactsApi } from "./contactsApi";
import type { ContactsApi, Decision, InvitationView } from "./types";

export type FlowState =
  | { step: "loading" }
  | { step: "loadError" }
  | { step: "inactive" }
  | { step: "already"; invitation: InvitationView }
  | { step: "invitation"; invitation: InvitationView; submitting: Decision | null; error: boolean }
  | { step: "accepted"; invitation: InvitationView }
  | { step: "rejected"; invitation: InvitationView };

// Nunca se muestra "aceptada" si el servidor no lo confirmó (AGENTS.md, E1).
export function useInvitationFlow(token: string, api: ContactsApi = contactsApi) {
  const [state, setState] = useState<FlowState>({ step: "loading" });
  const [attempt, setAttempt] = useState(0);
  const inFlight = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setState({ step: "loading" });
    api
      .getInvitation(token)
      .then((result) => {
        if (cancelled) return;
        if (result.kind === "not_found") return setState({ step: "inactive" });
        const { invitation } = result;
        if (invitation.status === "pending") {
          setState({ step: "invitation", invitation, submitting: null, error: false });
        } else if (invitation.status === "accepted") {
          setState({ step: "already", invitation });
        } else {
          setState({ step: "inactive" }); // rechazada, vencida o cancelada
        }
      })
      .catch(() => {
        if (!cancelled) setState({ step: "loadError" });
      });
    return () => {
      cancelled = true;
    };
  }, [token, api, attempt]);

  const respond = useCallback(
    async (decision: Decision) => {
      if (state.step !== "invitation" || inFlight.current) return;
      inFlight.current = true;
      const { invitation } = state;
      setState({ step: "invitation", invitation, submitting: decision, error: false });
      try {
        const result = await api.respond(token, decision);
        setState(result.kind === "inactive" ? { step: "inactive" } : { step: result.status, invitation });
      } catch {
        setState({ step: "invitation", invitation, submitting: null, error: true });
      } finally {
        inFlight.current = false;
      }
    },
    [state, token, api],
  );

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { state, respond, retry };
}
