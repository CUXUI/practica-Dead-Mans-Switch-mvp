import { NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { programar, cancelarProgramado } from "@/app/aviso/_datos/qstash";

// POST /api/alerta/cancelar
// E6: quien emite cancela una falsa alarma. Cierra el aviso en alerta y deja registrada su
// confirmación. Todo corre en el servidor y con la sesión de quien emite (RLS): nadie puede
// cancelar la alerta de otra persona. Responde ok solo si el servidor guardó el cambio.
//
// Qué pasa con el aviso al cancelar:
// - "Solo hoy": la salida terminó, el aviso queda apagado.
// - "A diario" o "Elegir días": la rutina sigue. El aviso vuelve a quedar ENCENDIDO en su próximo plazo
//   (lo calcula el navegador, que conoce la zona horaria; aquí se valida) y se reprograma el disparo.
//   Si no se pudo programar, la alerta se cancela igual y el aviso queda apagado (se ve en Inicio).
export const runtime = "nodejs";

const MIN = 60_000;
const DIA = 86_400_000;

export async function POST(req: Request) {
  const entrada = (await req.json().catch(() => null)) as { proximo?: string | null } | null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
  }

  // 1. Leer el aviso en alerta para saber si la rutina sigue.
  const { data: aviso, error: errA } = await supabase
    .from("notices")
    .select("id, recurrence, grace_minutes")
    .eq("issuer_id", user.id)
    .eq("state", "alert")
    .maybeSingle();
  if (errA) {
    return NextResponse.json({ ok: false, error: "No se pudo cancelar la alerta." }, { status: 500 });
  }
  if (!aviso) {
    return NextResponse.json({ ok: false, error: "No hay una alerta en curso." }, { status: 409 });
  }
  const noticeId = aviso.id as string;

  // 2. Si el aviso se repite y el próximo plazo es válido, se programa su disparo antes de guardar nada.
  let cambios: { state: string; fire_at?: string; qstash_message_id: string | null } = { state: "off", qstash_message_id: null };
  let mensajeNuevo: string | null = null;
  const proximo = aviso.recurrence !== "once" ? plazoValido(entrada?.proximo) : null;
  if (proximo) {
    const graciaMin = (aviso.grace_minutes as number | null) ?? 0;
    const programado = await programar(noticeId, new Date(proximo.getTime() + graciaMin * MIN));
    if (programado.ok) {
      mensajeNuevo = programado.messageId;
      cambios = { state: "active", fire_at: proximo.toISOString(), qstash_message_id: mensajeNuevo };
    } else {
      console.error("[cancelar] no se pudo programar el próximo plazo: el aviso queda apagado");
    }
  }

  // 3. Cerrar la alerta. El filtro por estado hace que repetir la petición no registre dos cancelaciones.
  const { data: cerrados, error: updateErr } = await supabase
    .from("notices")
    .update({ ...cambios, updated_at: new Date().toISOString() })
    .eq("id", noticeId)
    .eq("issuer_id", user.id)
    .eq("state", "alert")
    .select("id");
  if (updateErr || !cerrados || cerrados.length === 0) {
    await cancelarProgramado(mensajeNuevo);
    if (updateErr) {
      return NextResponse.json({ ok: false, error: "No se pudo cancelar la alerta." }, { status: 500 });
    }
    return NextResponse.json({ ok: false, error: "No hay una alerta en curso." }, { status: 409 });
  }

  // 4. Si el motor ya registró el disparo en `alerts`, cerrarlo. Las escrituras de esa tabla
  //    son solo del servidor (service_role). Hoy /api/alert no crea esa fila; cuando lo haga,
  //    queda cerrada aquí sin tocar nada más.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
      auth: { persistSession: false },
    });
    const { error: alertErr } = await admin
      .from("alerts")
      .update({ outcome: "closed", closed_at: new Date().toISOString() })
      .eq("notice_id", noticeId)
      .eq("outcome", "open");
    if (alertErr) console.error("No se pudo cerrar la fila de alerts:", alertErr.message);
  }

  // 5. Registrar la confirmación (E1, E6: cancelar es confirmar que está bien).
  const { error: confirmErr } = await supabase
    .from("confirmations")
    .insert({ issuer_id: user.id, notice_id: noticeId, source: "app" });
  if (confirmErr) {
    return NextResponse.json(
      { ok: false, error: "La alerta se canceló, pero no se pudo guardar en tu historial." },
      { status: 500 }
    );
  }

  // R7 (avisar a los contactos que la alerta se cerró) lo resuelve el motor del núcleo.
  return NextResponse.json({ ok: true, sigueEncendido: cambios.state === "active" });
}

// El próximo plazo que manda el navegador: futuro (al menos 1 min) y a no más de 8 días.
function plazoValido(valor: string | null | undefined): Date | null {
  if (!valor) return null;
  const d = new Date(valor);
  const falta = d.getTime() - Date.now();
  if (Number.isNaN(falta) || falta < MIN || falta > 8 * DIA) return null;
  return d;
}
