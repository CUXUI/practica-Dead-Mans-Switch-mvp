// Solo servidor. Motor de escalado de la alerta (S2, S5): avisa a los contactos de a uno,
// registra cada envío y vence la alerta por tiempo.
import { randomBytes, createHash } from "node:crypto";
import { Client, Receiver } from "@upstash/qstash";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";
import { getBrand } from "@/lib/brand";

// Tiempo entre un contacto y el siguiente. Valor provisorio (el PRD no lo define): 30 min.
export const MINUTOS_ENTRE_CONTACTOS = 30;
// Vencimiento por tiempo si nadie cierra la alerta (S5, decidido: 48 h).
export const HORAS_VENCIMIENTO = 48;

// URL pública de la app: la que va en los enlaces del correo.
export function appUrl(): string | null {
  return process.env.NEXT_PUBLIC_APP_URL ?? null;
}

// URL a la que QStash llama las rutas del motor. Puede diferir de la pública (por ejemplo, un túnel en pruebas).
function urlDeLlamadas(): string | null {
  return process.env.QSTASH_CALLBACK_URL ?? appUrl();
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
  const base = urlDeLlamadas();
  if (!qstash || !base) {
    console.warn(`[motor] sin QSTASH_TOKEN o URL de la app: no se programó ${path}`);
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

// Token de la pantalla de la alerta: un valor aleatorio por envío. En la base solo se guarda su hash
// SHA-256 en hexadecimal (alert_recipients.token_hash), igual que valida get_alert_view.
export function crearToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  const hash = createHash("sha256").update(token).digest("hex");
  return { token, hash };
}

// Mensaje opcional que quien emite dejó en su aviso («Mensaje para tus contactos»). Lo reciben solo con la
// alerta. null si no escribió ninguno. Se lee con el cliente de administración: quien recibe no tiene sesión.
export async function mensajeDelAviso(admin: SupabaseClient, alertId: string): Promise<string | null> {
  const { data: alerta } = await admin.from("alerts").select("notice_id").eq("id", alertId).maybeSingle();
  if (!alerta?.notice_id) return null;
  const { data } = await admin.from("notice_extras").select("message").eq("notice_id", alerta.notice_id).maybeSingle();
  const mensaje = (data?.message as string | null | undefined)?.trim();
  return mensaje ? mensaje : null;
}

// Lo mismo, a partir del token del enlace de la alerta (para la pantalla pública /alerta/[token]).
// Solo se usa el hash del token, igual que get_alert_view; sin token válido no devuelve nada.
export async function mensajeDeLaAlertaPorToken(admin: SupabaseClient, token: string): Promise<string | null> {
  const hash = createHash("sha256").update(token).digest("hex");
  const { data: destino } = await admin.from("alert_recipients").select("alert_id").eq("token_hash", hash).limit(1).maybeSingle();
  if (!destino?.alert_id) return null;
  return mensajeDelAviso(admin, destino.alert_id as string);
}

// Avisa a un contacto por correo, con el enlace a la pantalla de la alerta (R2) y el de baja (R1),
// registra el intento y marca el destinatario como avisado. Cada envío genera un token nuevo:
// el enlace de la alerta anterior deja de valer.
export async function avisarAContacto(admin: SupabaseClient, alertId: string, contacto: Contacto, quien: string): Promise<boolean> {
  const marca = getBrand();
  const { token, hash } = crearToken();
  await admin
    .from("alert_recipients")
    .update({ token_hash: hash })
    .eq("alert_id", alertId)
    .eq("contact_id", contacto.id);

  const base = appUrl();
  const enlace = base ? `${base}/alerta/${encodeURIComponent(token)}` : null;
  const enlaceBaja = await crearEnlaceBaja(admin, contacto.id);
  const mensaje = await mensajeDelAviso(admin, alertId).catch(() => null);
  let resultado: "sent" | "failed" = "sent";
  let idProveedor: string | null = null;
  try {
    const envio = await sendEmail({
      to: contacto.email,
      subject: `${marca.name}: ${quien} no confirmó que está bien`,
      html: `<p>Hola ${escapar(contacto.name)}.</p>
             <p>${escapar(quien)} te tiene como contacto de confianza en ${escapar(marca.name)}.
             Hoy no confirmó que está bien a la hora prevista.</p>
             <p>Puede ser falta de batería o de señal. Si puedes, comunícate con esa persona.</p>
             ${
               mensaje
                 ? `<p><strong>Mensaje de ${escapar(quien)}:</strong></p>
             <blockquote style="margin:0 0 16px;padding:8px 12px;border-left:4px solid #999">${escapar(mensaje).replace(/\r?\n/g, "<br>")}</blockquote>`
                 : ""
             }
             ${enlace ? `<p><a href="${enlace}">Ver la alerta</a></p>` : ""}
             ${enlaceBaja ? `<hr><p><a href="${escapar(enlaceBaja)}">Dejar de ser contacto de ${escapar(quien)}</a></p>` : ""}`,
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

// Enlace opaco para dejar de ser contacto (R1). Solo se guarda el hash del token; la página no recibe IDs.
async function crearEnlaceBaja(admin: SupabaseClient, contactId: string): Promise<string | null> {
  const base = appUrl();
  if (!base) return null;
  const token = randomBytes(32).toString("base64url");
  const requestTokenHash = createHash("sha256").update(token).digest("hex");
  const { error } = await admin.from("contact_removals").insert({
    contact_id: contactId,
    request_token_hash: requestTokenHash,
    code_hash: null,
    expires_at: new Date(Date.now() + 30 * 86_400_000).toISOString(),
  });
  if (error) {
    console.error("[baja] no se pudo crear el enlace:", error.message);
    return null;
  }
  return `${base.replace(/\/$/, "")}/baja/${encodeURIComponent(token)}`;
}

export function escapar(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
