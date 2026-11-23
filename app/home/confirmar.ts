"use server";

import { revalidatePath } from "next/cache";
import { getBrand } from "@/lib/brand";
import { textosInicio } from "@/components/home/textosInicio";
import { CONFIG_EMISOR } from "@/app/aviso/_datos/config";
import { exigirSesion } from "@/app/aviso/_datos/sesion";
import { cancelarProgramado, programar } from "@/app/aviso/_datos/qstash";

// "Estoy bien" desde Inicio (E1). Guarda la confirmación, pasa el aviso a su próximo plazo
// ("Solo hoy" termina y se apaga) y reprograma el disparo en QStash.
// Solo responde ok cuando el servidor guardó todo: nunca "confirmado" si no llegó (AGENTS.md, E1).
//
// La zona horaria de la persona solo la conoce el navegador, así que el próximo plazo se calcula ahí
// (igual que al encender el aviso) y aquí se valida: futuro, a días enteros del plazo actual y no más
// de 7 días después.
//
// Con una alerta en curso no se confirma aquí: confirmar es cancelar (E6, /api/alerta/cancelar).

export type ResultadoConfirmar = { ok: true } | { ok: false; error: string; reintentable: boolean };

const MIN = 60_000;
const DIA = 86_400_000;

export async function confirmarAviso(entrada: { plazo: string; proximo: string | null }): Promise<ResultadoConfirmar> {
  const s = await exigirSesion();
  const t = textosInicio(getBrand().variant).confirmar;
  // Fallas de red, base o QStash: se puede reintentar. Las de estado (temprano, tarde, alerta): no.
  const falla = (error = t.error, reintentable = true): ResultadoConfirmar => ({ ok: false, error, reintentable });
  const fija = (error: string) => falla(error, false);

  const plazoCliente = new Date(entrada.plazo).getTime();
  if (Number.isNaN(plazoCliente)) return fija(t.cambio);

  // 1. Leer el aviso abierto (hay como máximo uno activo o en alerta por persona).
  const { data: aviso, error: errA } = await s.supabase
    .from("notices")
    .select("id, state, recurrence, fire_at, grace_minutes, qstash_message_id, activated_at")
    .eq("issuer_id", s.user.id)
    .in("state", ["active", "alert"])
    .maybeSingle();
  if (errA) return falla();

  if (!aviso) {
    // "Solo hoy" ya confirmado y apagado: la respuesta anterior se perdió en el camino.
    if (entrada.proximo === null && (await yaConfirmado(s, null, plazoCliente - CONFIG_EMISOR.ventanaConfirmarMin * MIN))) return { ok: true };
    return fija(t.cambio);
  }
  if (aviso.state === "alert") return fija(t.enAlerta);

  const plazo = new Date(aviso.fire_at as string).getTime();
  const graciaMin = (aviso.grace_minutes as number | null) ?? 0;

  // El plazo que ve el navegador ya no es el de la base.
  if (plazo !== plazoCliente) {
    // Reintento de una confirmación que sí se guardó: el aviso ya está en el plazo que mandó el navegador.
    const proximo = entrada.proximo ? new Date(entrada.proximo).getTime() : NaN;
    if (plazo === proximo && (await yaConfirmado(s, aviso.id as string, inicioVentana(aviso, plazo)))) return { ok: true };
    return fija(t.cambio);
  }

  // 2. Solo dentro de la ventana: desde 30 min antes del plazo hasta el final del tiempo de gracia.
  const ahora = Date.now();
  if (ahora < inicioVentana(aviso, plazo)) return fija(t.temprano);
  if (ahora > plazo + graciaMin * MIN) return fija(t.tarde);

  const unaVez = aviso.recurrence === "once";
  const anterior = {
    state: "active",
    fire_at: aviso.fire_at as string,
    qstash_message_id: (aviso.qstash_message_id as string | null) ?? null,
  };

  // 3. Calcular el cambio del aviso.
  let cambios: { state: string; fire_at: string; qstash_message_id: string | null };
  let mensajeNuevo: string | null = null;
  if (unaVez) {
    // "Solo hoy": la salida terminó. El aviso se apaga y no se programa nada.
    cambios = { state: "off", fire_at: anterior.fire_at, qstash_message_id: null };
  } else {
    const proximo = validarProximo(entrada.proximo, plazo, aviso.recurrence as string, ahora);
    if (!proximo) return fija(t.cambio);
    // Primero se programa el disparo nuevo: si QStash falla, no se cambia nada.
    const programado = await programar(aviso.id as string, new Date(proximo.getTime() + graciaMin * MIN));
    if (!programado.ok) return falla();
    mensajeNuevo = programado.messageId;
    cambios = { state: "active", fire_at: proximo.toISOString(), qstash_message_id: mensajeNuevo };
  }

  // 4. Guardar el aviso. El filtro por estado y plazo evita que dos toques lo avancen dos veces y que
  //    se confirme encima de una alerta que el motor acaba de disparar.
  const { data: guardados, error: errU } = await s.supabase
    .from("notices")
    .update({ ...cambios, updated_at: new Date().toISOString() })
    .eq("id", aviso.id)
    .eq("state", "active")
    .eq("fire_at", anterior.fire_at)
    .select("id");
  if (errU || !guardados || guardados.length === 0) {
    await cancelarProgramado(mensajeNuevo);
    if (errU) return falla();
    // No se guardó porque el aviso cambió entre medio (por ejemplo, el motor lo pasó a alerta).
    const { data: ahoraAviso } = await s.supabase.from("notices").select("state").eq("id", aviso.id).maybeSingle();
    return fija(ahoraAviso?.state === "alert" ? t.enAlerta : t.cambio);
  }

  // 5. Guardar la confirmación. Si falla, el aviso vuelve a como estaba: nunca medio confirmado.
  const { error: errC } = await s.supabase
    .from("confirmations")
    .insert({ issuer_id: s.user.id, notice_id: aviso.id, source: "app" });
  if (errC) {
    await s.supabase
      .from("notices")
      .update({ ...anterior, updated_at: new Date().toISOString() })
      .eq("id", aviso.id)
      .eq("state", cambios.state)
      .eq("fire_at", cambios.fire_at);
    await cancelarProgramado(mensajeNuevo);
    return falla();
  }

  // 6. Todo guardado: se borra el disparo del plazo que ya se confirmó.
  await cancelarProgramado(anterior.qstash_message_id);

  revalidatePath("/home");
  return { ok: true };
}

// El próximo plazo que manda el navegador tiene que ser futuro, a días enteros del actual (con una hora
// de margen por el cambio de horario) y, para una rutina diaria, justo al día siguiente.
function validarProximo(valor: string | null, plazo: number, recurrence: string, ahora: number): Date | null {
  if (!valor) return null;
  const proximo = new Date(valor);
  const t = proximo.getTime();
  if (Number.isNaN(t) || t - ahora < MIN) return null;
  const dias = Math.round((t - plazo) / DIA);
  if (Math.abs(t - plazo - dias * DIA) > 60 * MIN) return null;
  if (recurrence === "daily" ? dias !== 1 : dias < 1 || dias > 7) return null;
  return proximo;
}

// Desde cuándo se puede confirmar: desde que se encendió el aviso (activated_at). Si no hay dato, 30 min antes del plazo.
function inicioVentana(aviso: { activated_at?: unknown }, plazo: number): number {
  const activado = typeof aviso.activated_at === "string" ? new Date(aviso.activated_at).getTime() : NaN;
  return Number.isNaN(activado) ? plazo - CONFIG_EMISOR.ventanaConfirmarMin * MIN : activado;
}

// ¿Hay una confirmación guardada para ese plazo? Sirve para responder ok, sin guardar otra, cuando el
// navegador reintenta porque no le llegó la respuesta de una confirmación que sí quedó registrada.
async function yaConfirmado(s: Awaited<ReturnType<typeof exigirSesion>>, noticeId: string | null, desde: number) {
  let consulta = s.supabase
    .from("confirmations")
    .select("id")
    .eq("issuer_id", s.user.id)
    .gte("confirmed_at", new Date(desde).toISOString())
    .limit(1);
  if (noticeId) consulta = consulta.eq("notice_id", noticeId);
  const { data } = await consulta;
  return (data ?? []).length > 0;
}
