// Solo servidor. Motor de escalado de la alerta (S2, S5): avisa a los contactos de a uno,
// registra cada envío y vence la alerta por tiempo.
import { Client, Receiver } from "@upstash/qstash";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";
import { getBrand } from "@/lib/brand";

// Tiempo entre un contacto y el siguiente. Valor provisorio (el PRD no lo define): 30 min.
export const MINUTOS_ENTRE_CONTACTOS = 30;
// Vencimiento por tiempo si nadie cierra la alerta (S5, decidido: 48 h).
export const HORAS_VENCIMIENTO = 48;

export function appUrl(): string | null {
  return process.env.NEXT_PUBLIC_APP_URL ?? null;
}

export function clienteQStash(): Client | null {
  const token = process.env.QSTASH_TOKEN;
  if (!token) return null;
  return new Client({ token, baseUrl: process.env.QSTASH_URL });
}

// Verifica que la llamada venga de QStash. Devuelve false si la firma no coincide.
export async function firmaValida(req: Request, body: string): Promise<boolean> {
  const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY ?? "",
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY ?? "",
  });
  try {
    await receiver.verify({ signature: req.headers.get("upstash-signature") ?? "", body });
    return true;
  } catch {
    return false;
  }
}

// Programa una llamada a una ruta del motor a una hora dada. Devuelve el ID del mensaje.
export async function programarLlamada(path: string, cuerpo: object, cuando: Date): Promise<string | null> {
  const qstash = clienteQStash();
  const base = appUrl();
  if (!qstash || !base) {
    console.warn(`[motor] sin QSTASH_TOKEN o NEXT_PUBLIC_APP_URL: no se programó ${path}`);
    return null;
  }
  const res = await qstash.publishJSON({
    url: `${base}${path}`,
    body: cuerpo,
    notBefore: Math.floor(cuando.getTime() / 1000),
  });
  return "messageId" in res ? res.messageId : null;
}

type Contacto = { id: string; name: string; email: string };

// Contactos aceptados de un aviso, en el orden en que se avisan.
export async function contactosDelAviso(admin: SupabaseClient, noticeId: string): Promise<Contacto[]> {
  const { data } = await admin
    .from("notice_contacts")
    .select("position, contacts(id, name, email, status)")
    .eq("notice_id", noticeId)
    .order("position");
  return (data ?? []).flatMap((fila) => {
    const c = Array.isArray(fila.contacts) ? fila.contacts[0] : fila.contacts;
    return c && c.status === "accepted" ? [{ id: c.id, name: c.name, email: c.email }] : [];
  });
}

// Avisa a un contacto por correo, registra el intento y marca el destinatario como avisado.
// El correo va sin enlace hasta que exista la pantalla de la alerta (R2).
export async function avisarAContacto(admin: SupabaseClient, alertId: string, contacto: Contacto, quien: string): Promise<boolean> {
  const marca = getBrand();
  let resultado: "sent" | "failed" = "sent";
  let idProveedor: string | null = null;
  try {
    const envio = await sendEmail({
      to: contacto.email,
      subject: `${marca.name}: ${quien} no confirmó que está bien`,
      html: `<p>Hola ${escapar(contacto.name)}.</p>
             <p>${escapar(quien)} te tiene como contacto de confianza en ${escapar(marca.name)}.
             Hoy no confirmó que está bien a la hora prevista.</p>
             <p>Puede ser falta de batería o de señal. Si podés, comunicate con esa persona.</p>`,
    });
    idProveedor = (envio as { id?: string } | null)?.id ?? null;
  } catch {
    resultado = "failed";
  }

  await admin.from("delivery_attempts").insert({
    alert_id: alertId,
    contact_id: contacto.id,
    channel: "email",
    result: resultado,
    provider_message_id: idProveedor,
  });
  if (resultado === "sent") {
    await admin
      .from("alert_recipients")
      .update({ notified_at: new Date().toISOString() })
      .eq("alert_id", alertId)
      .eq("contact_id", contacto.id);
  }
  return resultado === "sent";
}

export function escapar(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
