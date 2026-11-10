"use server";

import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getBrand } from "@/lib/brand";
import { sendEmail } from "@/lib/email";
import { textosContactos } from "@/components/contactos/textos";
import { CONFIG_EMISOR } from "@/app/aviso/_datos/config";
import { exigirSesion, type Sesion } from "@/app/aviso/_datos/sesion";
import { adaptadorExtras } from "@/app/aviso/_datos/adaptador";

// E5 · Invitar contactos. El contacto se guarda como `pending` con el hash del token;
// el token en claro solo viaja en el enlace del correo.

export type EstadoInvitar = {
  error?: string;
  campo?: "name" | "email";
  valores?: { name: string; email: string };
};

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function nuevoToken() {
  const token = randomBytes(32).toString("base64url");
  const hash = createHash("sha256").update(token).digest("hex");
  return { token, hash };
}

function escaparHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

// Guarda si la invitación salió (para no decir "enviada" cuando no salió).
async function anotarEnvio(s: Sesion, contactId: string, enviado: boolean) {
  await adaptadorExtras(s.supabase)
    .marcarInvitacion(s.user.id, contactId, enviado ? new Date().toISOString() : null)
    .catch((e) => console.error("[contactos] envío no anotado:", e instanceof Error ? e.message : e));
}

// Devuelve true solo si Resend aceptó el correo.
async function enviarInvitacion(s: Sesion, contacto: { name: string; email: string }, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return false;
  const brand = getBrand();
  const t = textosContactos(brand.variant).correo;
  const { data: perfil } = await s.supabase.from("profiles").select("full_name").eq("id", s.user.id).single();
  const quien = escaparHtml(perfil?.full_name?.trim() || "Una persona");
  // El enlace lleva al flujo de quien recibe (/invitacion), que todavía no existe.
  const enlace = `${appUrl}/invitacion?token=${encodeURIComponent(token)}`;
  try {
    await sendEmail({
      to: contacto.email,
      subject: t.asunto(perfil?.full_name?.trim() || "Una persona"),
      html: t.cuerpo(escaparHtml(contacto.name), quien, escaparHtml(brand.name), enlace),
    });
    return true;
  } catch (e) {
    console.error("[contactos] invitación no enviada:", e instanceof Error ? e.message : e);
    return false;
  }
}

export async function invitarContacto(_prev: EstadoInvitar, form: FormData): Promise<EstadoInvitar> {
  const s = await exigirSesion();
  const t = textosContactos(getBrand().variant).nuevo;
  const name = String(form.get("name") ?? "").trim().slice(0, 80);
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const valores = { name, email };

  if (!name) return { error: t.errorNombre, campo: "name", valores };
  if (!CORREO_VALIDO.test(email)) return { error: t.errorCorreo, campo: "email", valores };

  const { data: actuales, error: errLeer } = await s.supabase
    .from("contacts")
    .select("email, position")
    .eq("issuer_id", s.user.id)
    .neq("status", "removed");
  if (errLeer) return { error: t.errorGuardar, valores };
  if (actuales.some((c) => c.email.toLowerCase() === email)) return { error: t.errorRepetido, campo: "email", valores };
  if (actuales.length >= CONFIG_EMISOR.contactosMax) return { error: t.errorMaximo, valores };

  const ocupadas = new Set(actuales.map((c) => c.position));
  const position = [1, 2, 3, 4, 5].find((p) => !ocupadas.has(p))!;
  const { token, hash } = nuevoToken();

  const { data: nuevo, error: errInsert } = await s.supabase
    .from("contacts")
    .insert({
      issuer_id: s.user.id,
      name,
      email,
      position,
      status: "pending",
      invite_token_hash: hash,
    })
    .select("id")
    .single();
  if (errInsert || !nuevo) return { error: t.errorGuardar, valores };

  const enviado = await enviarInvitacion(s, { name, email }, token);
  await anotarEnvio(s, nuevo.id as string, enviado);
  revalidatePath("/contactos");
  redirect(enviado ? "/contactos?enviada=1" : "/contactos?fallo=1");
}

export type EstadoReenviar = { ok?: boolean; error?: string };

export async function reenviarInvitacion(_prev: EstadoReenviar, form: FormData): Promise<EstadoReenviar> {
  const s = await exigirSesion();
  const t = textosContactos(getBrand().variant).lista;
  const id = String(form.get("contact_id") ?? "");
  const { data: c } = await s.supabase
    .from("contacts")
    .select("id, name, email, status")
    .eq("id", id)
    .eq("issuer_id", s.user.id)
    .maybeSingle();
  if (!c || c.status !== "pending") return { error: t.falloCorreo };

  // Un enlace nuevo invalida el anterior.
  const { token, hash } = nuevoToken();
  const { error } = await s.supabase.from("contacts").update({ invite_token_hash: hash }).eq("id", c.id);
  if (error) return { error: t.falloCorreo };
  // El enlace anterior ya no vale: si este correo falla, la invitación queda sin enviar.
  const enviado = await enviarInvitacion(s, c, token);
  await anotarEnvio(s, c.id, enviado);
  revalidatePath("/contactos");
  return enviado ? { ok: true } : { error: t.falloCorreo };
}
