import { createHash, randomBytes, randomInt } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { clienteAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { getBrand } from "@/lib/brand";

export const runtime = "nodejs";
const VIGENCIA_MINUTOS = 15;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { email?: string } | null;
  const email = body?.email?.trim().toLowerCase();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ kind: "invalid_email" }, { status: 400 });
  }

  const admin = clienteAdmin();
  if (!admin) return NextResponse.json({ kind: "error" }, { status: 500 });
  const { data: contacts } = await admin
    .from("contacts")
    .select("id, name, email, issuer_id")
    .ilike("email", email)
    .eq("status", "accepted")
    .order("created_at", { ascending: false })
    .limit(2);

  if (!contacts?.length) return NextResponse.json({ kind: "not_found" }, { status: 404 });
  if (contacts.length > 1) return NextResponse.json({ kind: "multiple" }, { status: 409 });
  const contact = contacts[0];

  const { data: recent } = await admin
    .from("contact_removals")
    .select("code_sent_at")
    .eq("contact_id", contact.id)
    .not("code_sent_at", "is", null)
    .order("code_sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (recent?.code_sent_at && Date.now() - new Date(recent.code_sent_at).getTime() < 30_000) {
    return NextResponse.json({ kind: "wait" }, { status: 429 });
  }

  const token = randomBytes(32).toString("base64url");
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const codeHash = createHash("sha256").update(`${token}:${code}`).digest("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + VIGENCIA_MINUTOS * 60_000);
  const { data: removal, error: insertError } = await admin
    .from("contact_removals")
    .insert({
      contact_id: contact.id,
      request_token_hash: tokenHash,
      code_hash: codeHash,
      expires_at: expiresAt.toISOString(),
      code_sent_at: now.toISOString(),
      code_attempts: 0,
    })
    .select("id")
    .single();
  if (insertError || !removal) return NextResponse.json({ kind: "error" }, { status: 500 });

  const { data: profile } = await admin.from("profiles").select("full_name").eq("id", contact.issuer_id).maybeSingle();
  const issuerName = profile?.full_name?.trim() || "esta persona";
  const brand = getBrand();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const verificationUrl = baseUrl ? `${baseUrl}/baja/${encodeURIComponent(token)}#codigo=${code}` : null;
  try {
    await sendEmail({
      to: contact.email,
      subject: `${brand.name}: tu código para dejar de ser contacto`,
      html: codigoEmail({ brand: brand.name, color: brand.themeColor, name: contact.name, issuerName, code, verificationUrl }),
    });
  } catch (error) {
    console.error("[baja] no se pudo enviar el código:", error instanceof Error ? error.message : error);
    await admin.from("contact_removals").delete().eq("id", removal.id);
    return NextResponse.json({ kind: "error" }, { status: 502 });
  }

  return NextResponse.json({ kind: "ok", token });
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function codigoEmail({ brand, color, name, issuerName, code, verificationUrl }: {
  brand: string; color: string; name: string; issuerName: string; code: string; verificationUrl: string | null;
}) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta http-equiv="Content-Language" content="es"></head>
  <body style="margin:0;background:#f5f5f5;font-family:Arial,sans-serif;color:#242424"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border-radius:16px"><tr><td style="padding:24px;font-size:18px;font-weight:700"><span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;background:${escapeHtml(color)};color:#fff;margin-right:8px">${escapeHtml(brand.slice(0, 1))}</span>${escapeHtml(brand)}</td></tr>
  <tr><td style="padding:8px 24px"><h1 style="font-size:28px;line-height:36px">Tu código para dejar de ser contacto</h1><p>Hola ${escapeHtml(name)}. Usa este código para confirmar que quieres dejar de ser contacto de ${escapeHtml(issuerName)}.</p></td></tr>
  <tr><td align="center" style="padding:20px 24px"><div style="border:1px solid #767676;border-radius:12px;padding:20px;font-size:32px;font-weight:700;letter-spacing:8px;user-select:all">${code}</div></td></tr>
  ${verificationUrl ? `<tr><td style="padding:0 24px 16px"><a href="${escapeHtml(verificationUrl)}" style="display:block;padding:14px 20px;border-radius:12px;background:${escapeHtml(color)};color:#fff;text-align:center;text-decoration:none;font-weight:700">Abrir verificación</a></td></tr>` : ""}
  <tr><td style="padding:8px 24px 24px;color:#555">El código vence en ${VIGENCIA_MINUTOS} minutos. Si no solicitaste este cambio, ignora este correo.</td></tr></table>
  </td></tr></table></body></html>`;
}
