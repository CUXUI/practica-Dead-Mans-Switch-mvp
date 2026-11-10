"use server";

import { revalidatePath } from "next/cache";
import { getBrand } from "@/lib/brand";
import { textosAviso } from "@/components/aviso/textos";
import { CONFIG_EMISOR, configVersion } from "./_datos/config";
import { adaptadorExtras } from "./_datos/adaptador";
import { exigirSesion } from "./_datos/sesion";
import type { Frecuencia } from "./_datos/tipos";

// Guarda el aviso APAGADO (E3: el aviso nuevo empieza apagado; solo se edita apagado).
// No programa nada en QStash: encenderlo es otro paso, con al menos un contacto aceptado.
// No usa /api/notices del núcleo porque esa ruta crea el aviso ya activo.

export type DatosAviso = {
  frecuencia: Frecuencia;
  dias: number[];
  graciaMin: number;
  mensaje: string;
  pasos: string[];
  contactos: string[]; // ids en orden de aviso
  fireAt: string; // próximo plazo, calculado en el navegador con su zona horaria
};

export type ResultadoAviso = { ok: true } | { ok: false; error: string };

export async function guardarAviso(d: DatosAviso): Promise<ResultadoAviso> {
  const s = await exigirSesion();
  const brand = getBrand();
  const t = textosAviso(brand.variant);
  const cfg = configVersion(brand.variant);
  const falla = (error = t.resumen.errorGuardar): ResultadoAviso => ({ ok: false, error });

  // Validación (lo mismo que en la pantalla; el servidor no se fía del navegador).
  if (!["once", "daily", "weekly"].includes(d.frecuencia)) return falla();
  const dias = [...new Set(d.dias)].filter((x) => Number.isInteger(x) && x >= 0 && x <= 6).sort();
  if (d.frecuencia === "weekly" && dias.length === 0) return falla(t.hora.errorDias);
  if (!Number.isInteger(d.graciaMin) || d.graciaMin < CONFIG_EMISOR.gracia.minimoMin || d.graciaMin > CONFIG_EMISOR.gracia.maximoMin)
    return falla(t.hora.errorGracia);
  const fire = new Date(d.fireAt);
  const margen = fire.getTime() - Date.now();
  if (Number.isNaN(fire.getTime()) || margen < 30_000 || margen > 8 * 86_400_000) return falla(t.hora.errorPasada);
  const mensaje = String(d.mensaje ?? "").trim().slice(0, CONFIG_EMISOR.mensajeMax);
  const pasos = (d.pasos ?? [])
    .map((p) => String(p).trim().slice(0, CONFIG_EMISOR.pasoMax))
    .filter(Boolean)
    .slice(0, CONFIG_EMISOR.pasosMax);
  if (cfg.pasosObligatorios && pasos.length === 0) return falla(t.pasos.errorNinguno);
  const ids = [...new Set(d.contactos ?? [])].slice(0, CONFIG_EMISOR.contactosMax);
  if (ids.length === 0) return falla(t.contactos.errorNinguno);

  // Los contactos tienen que ser de la persona y no estar dados de baja ni haber rechazado.
  const { data: validos, error: errC } = await s.supabase
    .from("contacts")
    .select("id")
    .eq("issuer_id", s.user.id)
    .in("status", ["pending", "accepted"])
    .in("id", ids);
  if (errC || (validos ?? []).length !== ids.length) return falla();

  // Un solo aviso: si hay uno encendido o en alerta, no se edita.
  const { data: avisos, error: errA } = await s.supabase
    .from("notices")
    .select("id, state")
    .eq("issuer_id", s.user.id)
    .order("created_at", { ascending: false });
  if (errA) return falla();
  if ((avisos ?? []).some((a) => a.state !== "off")) return falla(t.resumen.errorEncendido);

  const fila = {
    kind: d.frecuencia === "once" ? "trip" : "routine",
    recurrence: d.frecuencia,
    fire_at: fire.toISOString(),
    grace_minutes: d.graciaMin,
    state: "off",
    updated_at: new Date().toISOString(),
  };

  // Se reutiliza el aviso apagado más reciente para no acumular avisos apagados.
  let noticeId = avisos?.[0]?.id as string | undefined;
  if (noticeId) {
    const { error } = await s.supabase.from("notices").update(fila).eq("id", noticeId);
    if (error) return falla();
  } else {
    const { data, error } = await s.supabase
      .from("notices")
      .insert({ ...fila, issuer_id: s.user.id })
      .select("id")
      .single();
    if (error || !data) return falla();
    noticeId = data.id as string;
  }

  // Contactos del aviso, en orden (notice_contacts).
  const { error: errDel } = await s.supabase.from("notice_contacts").delete().eq("notice_id", noticeId);
  if (errDel) return falla();
  const { error: errIns } = await s.supabase
    .from("notice_contacts")
    .insert(ids.map((contact_id, i) => ({ notice_id: noticeId, contact_id, position: i + 1 })));
  if (errIns) return falla();

  // Datos sin tabla todavía: van por el adaptador (config.ts).
  try {
    await adaptadorExtras(s.supabase).guardarAviso(s.user.id, noticeId, {
      mensaje,
      pasos,
      dias: d.frecuencia === "weekly" ? dias : [],
    });
  } catch (e) {
    console.error("[aviso] extras no guardados:", e instanceof Error ? e.message : e);
    return falla();
  }

  revalidatePath("/home");
  return { ok: true };
}
