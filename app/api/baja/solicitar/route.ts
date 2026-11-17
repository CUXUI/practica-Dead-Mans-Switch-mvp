import { createHash, randomInt } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { clienteAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { getBrand } from "@/lib/brand";

export const runtime = "nodejs";
const VIGENCIA_MINUTOS = 15;
const ESPERA_REENVIO_MS = 30_000;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { token?: string } | null;
  const token = body?.token?.trim();
  if (!token) return NextResponse.json({ kind: "inactive" }, { status: 400 });

  const admin = clienteAdmin();
  if (!admin) return NextResponse.json({ kind: "error" }, { status: 500 });
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { data: removal } = await admin
    .from("contact_removals")
    .select("id, contact_id, confirmed_at, code_sent_at")
    .eq("request_token_hash", tokenHash)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!removal || removal.confirmed_at) return NextResponse.json({ kind: "inactive" });

  const { data: contact } = await admin
    .from("contacts")
    .select("name, email, status, issuer_id")
    .eq("id", removal.contact_id)
    .maybeSingle();
  if (!contact || contact.status !== "accepted") return NextResponse.json({ kind: "inactive" });

  const sentAt = removal.code_sent_at ? new Date(removal.code_sent_at).getTime() : 0;
  if (Date.now() - sentAt < ESPERA_REENVIO_MS) {
    return NextResponse.json({ kind: "ok", maskedEmail: ocultarCorreo(contact.email) });
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const codeHash = createHash("sha256").update(`${token}:${code}`).digest("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + VIGENCIA_MINUTOS * 60_000);
  const { error: updateError } = await admin
    .from("contact_removals")
    .update({ code_hash: codeHash, expires_at: expiresAt.toISOString(), code_sent_at: now.toISOString(), code_attempts: 0 })
    .eq("id", removal.id);
  if (updateError) return NextResponse.json({ kind: "error" }, { status: 500 });

  const { data: profile } = await admin.from("profiles").select("full_name").eq("id", contact.issuer_id).maybeSingle();
  const issuerName = profile?.full_name?.trim() || "esta persona";
  const brand = getBrand();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const copyUrl = baseUrl ? `${baseUrl}/baja/${encodeURIComponent(token)}#codigo=${code}` : null;
  try {
    await sendEmail({
      to: contact.email,
      subject: `${brand.name}: tu código para dejar de ser contacto`,
      html: correoCodigo({
        marca: brand.name,
        color: brand.themeColor,
        contacto: contact.name,
        emisor: issuerName,
        code,
        copyUrl,
      }),
    });
  } catch (error) {
    console.error("[baja] no se pudo enviar el código:", error instanceof Error ? error.message : error);
    await admin
      .from("contact_removals")
      .update({ code_hash: null, code_sent_at: null, code_attempts: 0 })
      .eq("id", removal.id);
    return NextResponse.json({ kind: "error" }, { status: 502 });
  }

  return NextResponse.json({ kind: "ok", maskedEmail: ocultarCorreo(contact.email) });
}

function ocultarCorreo(email: string) {
  const [local, domain = "correo.com"] = email.split("@");
  return `${local.slice(0, 1)}${"•".repeat(Math.max(3, local.length - 1))}@${domain}`;
}

function escapar(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function correoCodigo({ marca, color, contacto, emisor, code, copyUrl }: {
  marca: string;
  color: string;
  contacto: string;
  emisor: string;
  code: string;
  copyUrl: string | null;
}) {
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta http-equiv="Content-Language" content="es"></head><body style="margin:0;background:#f5f5f5;font-family:Arial,sans-serif;color:#242424">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f5"><tr><td align="center" style="padding:24px 12px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
      <tr><td style="padding:24px 24px 8px;font-size:18px;font-weight:700">
        <span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;background:${escapar(color)};color:#fff;margin-right:8px">${escapar(marca.slice(0, 1))}</span>${escapar(marca)}
      </td></tr>
      <tr><td style="padding:20px 24px 8px"><h1 style="margin:0;font-size:28px;line-height:36px">Tu código para dejar de ser contacto</h1></td></tr>
      <tr><td style="padding:8px 24px;font-size:16px;line-height:24px">Hola ${escapar(contacto)}. Usa este código para confirmar que quieres dejar de ser contacto de ${escapar(emisor)}.</td></tr>
      <tr><td align="center" style="padding:20px 24px">
        <div style="border:1px solid #b9b9b9;border-radius:12px;padding:20px;font-size:32px;font-weight:700;letter-spacing:8px;user-select:all">${code}</div>
      </td></tr>
      ${copyUrl ? `<tr><td style="padding:0 24px 16px"><a href="${escapar(copyUrl)}" style="display:block;padding:14px 20px;border-radius:12px;background:${escapar(color)};color:#fff;text-align:center;text-decoration:none;font-weight:700">Abrir verificación</a></td></tr>` : ""}
      <tr><td style="padding:8px 24px 24px;font-size:14px;line-height:20px;color:#5f5f5f">El código vence en ${VIGENCIA_MINUTOS} minutos. También puedes seleccionar los seis dígitos y copiarlos. Si no solicitaste este cambio, ignora este correo.</td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}
