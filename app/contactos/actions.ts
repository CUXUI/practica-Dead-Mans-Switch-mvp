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
import { apagarSinAceptados, sacarDeAvisos } from "./_baja";

// E5 · Invitar contactos. El contacto se guarda como `pending` con el hash del token;
// el token en claro solo viaja en el enlace del correo.

export type EstadoInvitar = {
  error?: string;
  campo?: "name" | "email" | "mensaje";
  valores?: { name: string; email: string; relacion?: string; mensaje?: string };
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

// Mensaje personalizado guardado de ese contacto ("" = invitación General).
async function mensajeGuardado(s: Sesion, contactId: string) {
  const datos = await adaptadorExtras(s.supabase)
    .leerContactos(s.user.id, [contactId])
    .catch(() => ({}) as Record<string, { mensajeInvitacion: string | null }>);
  return datos[contactId]?.mensajeInvitacion ?? "";
}

// Devuelve true solo si Resend aceptó el correo.
async function enviarInvitacion(s: Sesion, contacto: { name: string; email: string }, token: string, mensaje = "") {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return false;
  const brand = getBrand();
  const t = textosContactos(brand.variant).correo;
  const { data: perfil } = await s.supabase.from("profiles").select("full_name").eq("id", s.user.id).single();
  const quien = escaparHtml(perfil?.full_name?.trim() || "Una persona");
  // El enlace va a la página de aceptar (R1): app/invitacion/[token]. El token va en la ruta, no en la consulta.
  // Reglas:
  //  - El enlace es /invitacion/<token>. El token va solo en el correo. En la base se guarda su
  //    SHA-256 en hex (contacts.invite_token_hash), igual que alert_recipients.token_hash.
  //  - Reenviar o cambiar el correo genera un token nuevo: el enlace anterior deja de valer.
  //  - Al aceptar, la página pone contacts.status = "accepted" y accepted_at. Al rechazar, "rejected".
  //    Solo si la invitación sigue "pending". Contactos e Inicio leen esos estados al entrar.
  //  - El mensaje propio de la invitación está en contact_details.invite_message (vacío = "General").
  const enlace = `${appUrl}/invitacion/${encodeURIComponent(token)}`;
  try {
    await sendEmail({
      to: contacto.email,
      subject: t.asunto(perfil?.full_name?.trim() || "Una persona"),
      html: t.cuerpo(escaparHtml(contacto.name), quien, escaparHtml(brand.name), enlace, escaparHtml(mensaje)),
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
  // Relación y mensaje personalizado (E-06).
  const relacion = String(form.get("relacion") ?? "").trim().slice(0, 40);
  const personalizado = form.get("modo") === "personalizado";
  const mensaje = personalizado ? String(form.get("mensaje") ?? "").trim().slice(0, CONFIG_EMISOR.mensajeMax) : "";
  const valores = { name, email, relacion, mensaje };

  if (!name) return { error: t.errorNombre, campo: "name", valores };
  if (!CORREO_VALIDO.test(email)) return { error: t.errorCorreo, campo: "email", valores };
  if (personalizado && !mensaje) return { error: t.errorMensaje, campo: "mensaje", valores };

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

  if (relacion) {
    await adaptadorExtras(s.supabase)
      .guardarRelacion(s.user.id, nuevo.id as string, relacion)
      .catch((e) => console.error("[contactos] relación no guardada:", e instanceof Error ? e.message : e));
  }
  // El mensaje se guarda para poder verlo en el detalle y usarlo al reenviar (migración 0011).
  if (mensaje) {
    await adaptadorExtras(s.supabase)
      .guardarMensajeInvitacion(s.user.id, nuevo.id as string, mensaje)
      .catch((e) => console.error("[contactos] mensaje no guardado:", e instanceof Error ? e.message : e));
  }
  const enviado = await enviarInvitacion(s, { name, email }, token, mensaje);
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
  if (!c) return { error: t.falloReenvio };
  if (c.status !== "pending") {
    // La página estaba desactualizada: la persona ya contestó. Se refresca la lista.
    revalidatePath("/contactos");
    return { error: t.yaRespondio };
  }

  // Un enlace nuevo invalida el anterior.
  const { token, hash } = nuevoToken();
  const { error } = await s.supabase.from("contacts").update({ invite_token_hash: hash }).eq("id", c.id);
  if (error) return { error: t.falloReenvio };
  // El enlace anterior ya no vale: si este correo falla, la invitación queda sin enviar.
  const enviado = await enviarInvitacion(s, c, token, await mensajeGuardado(s, c.id));
  await anotarEnvio(s, c.id, enviado);
  revalidatePath("/contactos");
  return enviado ? { ok: true } : { error: t.falloReenvio };
}

export type EstadoQuitar = { error?: string };

// Avisa por correo a quien ya no es contacto. Si el correo falla, la baja igual queda hecha.
async function avisarQuitado(s: Sesion, contacto: { name: string; email: string }) {
  const brand = getBrand();
  const t = textosContactos(brand.variant).correo.quitado;
  const { data: perfil } = await s.supabase.from("profiles").select("full_name").eq("id", s.user.id).single();
  const quien = escaparHtml(perfil?.full_name?.trim() || "Una persona");
  try {
    await sendEmail({
      to: contacto.email,
      subject: t.asunto(perfil?.full_name?.trim() || "Una persona"),
      html: t.cuerpo(escaparHtml(contacto.name), quien, escaparHtml(brand.name)),
    });
  } catch (e) {
    console.error("[contactos] aviso de baja no enviado:", e instanceof Error ? e.message : e);
  }
}

// E5 · Quitar un contacto. Libera su sitio (máximo 5) y lo saca del aviso.
export async function quitarContacto(_prev: EstadoQuitar, form: FormData): Promise<EstadoQuitar> {
  const s = await exigirSesion();
  const t = textosContactos(getBrand().variant).lista;
  const id = String(form.get("contact_id") ?? "");
  const { data: c } = await s.supabase
    .from("contacts")
    .select("id, name, email, status")
    .eq("id", id)
    .eq("issuer_id", s.user.id)
    .neq("status", "removed")
    .maybeSingle();
  if (!c) return { error: t.falloQuitar };
  const { error } = await s.supabase
    .from("contacts")
    .update({ status: "removed", removed_at: new Date().toISOString(), invite_token_hash: null })
    .eq("id", id);
  if (error) return { error: t.falloQuitar };
  await sacarDeAvisos(s.supabase, s.user.id, id);
  // Solo a quien ya era contacto (aceptó): a quien tenía una invitación pendiente no hace falta avisarle.
  if (c.status === "accepted") await avisarQuitado(s, { name: c.name, email: c.email });
  revalidatePath("/contactos");
  revalidatePath("/home");
  redirect("/contactos?quitado=1");
}

export type EstadoEditar = {
  error?: string;
  campo?: "name" | "email";
  valores?: { name: string; email: string; relacion: string };
};

// E-17 · Editar contacto ("reemplazar" de E5). Nombre y relación se guardan sin más.
// Si cambia el correo, la persona tiene que aceptar otra vez (decisión del 2/11): vuelve a "en espera",
// sale una invitación nueva y, si era la única que había aceptado, el aviso encendido se apaga.
export async function guardarContacto(_prev: EstadoEditar, form: FormData): Promise<EstadoEditar> {
  const s = await exigirSesion();
  const textos = textosContactos(getBrand().variant);
  const t = textos.editar;
  const id = String(form.get("contact_id") ?? "");
  const name = String(form.get("name") ?? "").trim().slice(0, 80);
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const relacion = String(form.get("relacion") ?? "").trim().slice(0, 40);
  const valores = { name, email, relacion };

  if (!name) return { error: textos.nuevo.errorNombre, campo: "name", valores };
  if (!CORREO_VALIDO.test(email)) return { error: textos.nuevo.errorCorreo, campo: "email", valores };

  const { data: todos, error: errLeer } = await s.supabase
    .from("contacts")
    .select("id, email, status")
    .eq("issuer_id", s.user.id)
    .neq("status", "removed");
  if (errLeer) return { error: t.errorGuardar, valores };
  const actual = todos.find((c) => c.id === id);
  if (!actual) return { error: t.noExiste, valores };
  if (todos.some((c) => c.id !== id && c.email.toLowerCase() === email)) return { error: textos.nuevo.errorRepetido, campo: "email", valores };

  const cambiaCorreo = actual.email.toLowerCase() !== email;
  if (cambiaCorreo) {
    // Con una alerta en curso no se cambia a quién se avisa.
    const { data: enAlerta } = await s.supabase.from("notices").select("id").eq("issuer_id", s.user.id).eq("state", "alert").limit(1);
    if (enAlerta?.length) return { error: t.errorAlerta, campo: "email", valores };
  }

  const { token, hash } = nuevoToken();
  const cambios = cambiaCorreo ? { name, email, status: "pending", accepted_at: null, invite_token_hash: hash } : { name };
  const { error } = await s.supabase.from("contacts").update(cambios).eq("id", id).eq("issuer_id", s.user.id);
  if (error) return { error: t.errorGuardar, valores };

  await adaptadorExtras(s.supabase)
    .guardarRelacion(s.user.id, id, relacion || null)
    .catch((e) => console.error("[contactos] relación no guardada:", e instanceof Error ? e.message : e));

  let destino = "/contactos?guardado=1";
  if (cambiaCorreo) {
    if (actual.status === "accepted") await apagarSinAceptados(s.supabase, s.user.id);
    const enviado = await enviarInvitacion(s, { name, email }, token, await mensajeGuardado(s, id));
    await anotarEnvio(s, id, enviado);
    destino = enviado ? "/contactos?correo=1" : "/contactos?fallo=1";
  }
  revalidatePath("/contactos");
  revalidatePath("/home");
  redirect(destino);
}
