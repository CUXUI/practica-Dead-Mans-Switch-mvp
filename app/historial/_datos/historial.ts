// Solo servidor. Lee el historial de quien emite (E7) con su sesión: el RLS de la base hace que
// cada consulta devuelva únicamente lo suyo.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Destinatario, EntradaHistorial, TipoAviso } from "@/components/historial/tipos";

export const LIMITE = 50;

// PREGUNTA ABIERTA (PRD preguntas 4 y 12): qué evento cuenta como "visto".
// Plan A del esquema: cuenta la apertura del enlace (link_opened). Plan B: solo el toque en el botón (button_tap).
// Si cambia el plan, se cambia solo esta lista; no hace falta migración.
const EVENTOS_QUE_CUENTAN_COMO_VISTO = ["link_opened", "button_tap"] as const;

type Fila<T> = { data: T[] | null; error: { message: string } | null };

export async function leerHistorial(supabase: SupabaseClient, userId: string): Promise<{ ok: true; entradas: EntradaHistorial[] } | { ok: false }> {
  const [conf, alertas, avisos] = (await Promise.all([
    supabase.from("confirmations").select("id, notice_id, confirmed_at, source").eq("issuer_id", userId).order("confirmed_at", { ascending: false }).limit(LIMITE),
    supabase.from("alerts").select("id, notice_id, started_at, closed_at, expires_at, outcome").eq("issuer_id", userId).order("started_at", { ascending: false }).limit(LIMITE),
    supabase.from("notices").select("id, kind").eq("issuer_id", userId),
  ])) as [
    Fila<{ id: string; notice_id: string | null; confirmed_at: string; source: "app" | "notification" }>,
    Fila<{ id: string; notice_id: string; started_at: string; closed_at: string | null; expires_at: string | null; outcome: "open" | "closed" | "unresolved" }>,
    Fila<{ id: string; kind: "routine" | "trip" }>,
  ];

  if (conf.error || alertas.error || avisos.error) return { ok: false };

  const tipoDeAviso = new Map((avisos.data ?? []).map((a) => [a.id, a.kind] as const));
  const tipo = (id: string | null): TipoAviso => (id ? (tipoDeAviso.get(id) ?? null) : null);

  // Cancelar una alerta (E6) también deja una confirmación. Esa confirmación y la alerta cerrada cuentan
  // lo mismo: se muestra solo la alerta, que ya dice a qué hora la cerraste.
  const cierres = (alertas.data ?? []).filter((a) => a.closed_at).map((a) => ({ aviso: a.notice_id, en: new Date(a.closed_at as string).getTime() }));
  const confirmaciones = (conf.data ?? []).filter(
    (c) => !cierres.some((x) => x.aviso === c.notice_id && Math.abs(new Date(c.confirmed_at).getTime() - x.en) <= 60_000)
  );

  const ids = (alertas.data ?? []).map((a) => a.id);
  const destinatariosPorAlerta = new Map<string, Destinatario[]>();

  if (ids.length > 0) {
    const [dest, vistas, intentos] = (await Promise.all([
      supabase.from("alert_recipients").select("alert_id, contact_id, contacts(name)").in("alert_id", ids),
      supabase.from("alert_views").select("alert_id, contact_id, event").in("alert_id", ids),
      supabase.from("delivery_attempts").select("alert_id, contact_id, channel, result").in("alert_id", ids),
    ])) as [
      Fila<{ alert_id: string; contact_id: string; contacts: { name: string } | { name: string }[] | null }>,
      Fila<{ alert_id: string; contact_id: string; event: string }>,
      Fila<{ alert_id: string; contact_id: string; channel: "push" | "email"; result: "sent" | "failed" | "bounced" }>,
    ];
    if (dest.error || vistas.error || intentos.error) return { ok: false };

    for (const d of dest.data ?? []) {
      const contacto = Array.isArray(d.contacts) ? d.contacts[0] : d.contacts;
      const clave = `${d.alert_id}:${d.contact_id}`;
      const lista = destinatariosPorAlerta.get(d.alert_id) ?? [];
      lista.push({
        nombre: contacto?.name ?? "",
        visto: (vistas.data ?? []).some(
          (v) => `${v.alert_id}:${v.contact_id}` === clave && (EVENTOS_QUE_CUENTAN_COMO_VISTO as readonly string[]).includes(v.event)
        ),
        canales: (intentos.data ?? [])
          .filter((i) => `${i.alert_id}:${i.contact_id}` === clave)
          .map((i) => ({ canal: i.channel, resultado: i.result })),
      });
      destinatariosPorAlerta.set(d.alert_id, lista);
    }
  }

  const entradas: EntradaHistorial[] = [
    ...confirmaciones.map((c) => ({ tipo: "confirmacion" as const, id: c.id, cuando: c.confirmed_at, origen: c.source, aviso: tipo(c.notice_id) })),
    ...(alertas.data ?? []).map((a) => ({
      tipo: "alerta" as const,
      id: a.id,
      cuando: a.started_at,
      resultado: a.outcome,
      aviso: tipo(a.notice_id),
      cerradaEn: a.closed_at,
      venceEn: a.expires_at,
      destinatarios: destinatariosPorAlerta.get(a.id) ?? [],
    })),
  ]
    .sort((a, b) => (a.cuando < b.cuando ? 1 : -1))
    .slice(0, LIMITE);

  return { ok: true, entradas };
}
