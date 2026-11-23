"use server";

import { revalidatePath } from "next/cache";
import { getBrand } from "@/lib/brand";
import { textosInicio } from "@/components/home/textosInicio";
import { exigirSesion } from "./_datos/sesion";
import { cancelarProgramado, programar } from "./_datos/qstash";

// Encender y apagar el aviso (E-14 y E-12 del wireflow). El aviso empieza apagado, se enciende solo
// si hay al menos un contacto aceptado en él y se edita solo apagado.
// Al encender programa el disparo en QStash (/api/alert del núcleo). Al apagar lo borra.

export type ResultadoEstado = { ok: true } | { ok: false; error: string };

export async function encenderAviso(fireAt: string): Promise<ResultadoEstado> {
  const s = await exigirSesion();
  const t = textosInicio(getBrand().variant).encender;
  const falla = (error = t.error): ResultadoEstado => ({ ok: false, error });

  const { data: avisos, error: errA } = await s.supabase
    .from("notices")
    .select("id, state, grace_minutes")
    .eq("issuer_id", s.user.id)
    .order("created_at", { ascending: false });
  if (errA) return falla();
  const lista = avisos ?? [];
  // Un solo aviso activo o en alerta por persona.
  if (lista.some((a) => a.state !== "off")) return falla(t.yaEncendido);
  const aviso = lista[0];
  if (!aviso) return falla(t.sinAviso);

  // Al menos un contacto del aviso tiene que haber aceptado (y no estar dado de baja).
  const { data: filas, error: errC } = await s.supabase.from("notice_contacts").select("contacts(status)").eq("notice_id", aviso.id);
  if (errC) return falla();
  const hayAceptado = (filas ?? []).some((f) => {
    const c = (Array.isArray(f.contacts) ? f.contacts[0] : f.contacts) as { status: string } | null;
    return c?.status === "accepted";
  });
  if (!hayAceptado) return falla(t.sinAceptado);

  const fire = new Date(fireAt);
  const margen = fire.getTime() - Date.now();
  if (Number.isNaN(fire.getTime()) || margen < 30_000 || margen > 8 * 86_400_000) return falla(t.horaPasada);

  const { error } = await s.supabase
    .from("notices")
    .update({ state: "active", fire_at: fire.toISOString(), activated_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", aviso.id)
    .eq("state", "off");
  if (error) return falla();

  // Programar el disparo en QStash (llamará a /api/alert a la hora del aviso). Un aviso encendido sin
  // disparo no avisaría nunca: si no se puede programar, se vuelve a apagar y se dice.
  // El aviso a los contactos sale al acabar el tiempo de gracia, no a la hora (PRD S1).
  const disparo = new Date(fire.getTime() + ((aviso.grace_minutes as number | null) ?? 0) * 60_000);
  const programado = await programar(aviso.id, disparo);
  if (!programado.ok) {
    await s.supabase.from("notices").update({ state: "off", qstash_message_id: null, updated_at: new Date().toISOString() }).eq("id", aviso.id);
    return falla();
  }
  if (programado.messageId) {
    await s.supabase.from("notices").update({ qstash_message_id: programado.messageId }).eq("id", aviso.id);
  }

  revalidatePath("/home");
  return { ok: true };
}

export async function apagarAviso(): Promise<ResultadoEstado> {
  const s = await exigirSesion();
  const t = textosInicio(getBrand().variant).apagar;

  const { data: aviso, error: errA } = await s.supabase
    .from("notices")
    .select("id, state, fire_at, qstash_message_id, activated_at")
    .eq("issuer_id", s.user.id)
    .in("state", ["active", "alert"])
    .maybeSingle();
  if (errA) return { ok: false, error: t.error };
  if (!aviso) return { ok: true }; // ya estaba apagado
  // Con una alerta en curso no se apaga: se cancela con "Estoy bien, cancelar alerta" (E-10).
  if (aviso.state === "alert") return { ok: false, error: t.enAlerta };

  const { error } = await s.supabase
    .from("notices")
    .update({ state: "off", qstash_message_id: null, updated_at: new Date().toISOString() })
    .eq("id", aviso.id)
    .eq("state", "active");
  if (error) return { ok: false, error: t.error };
  await cancelarProgramado(aviso.qstash_message_id as string | null);

  revalidatePath("/home");
  return { ok: true };
}
