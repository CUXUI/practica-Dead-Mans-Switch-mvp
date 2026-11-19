import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { clienteAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { getBrand } from "@/lib/brand";

export const runtime = "nodejs";

// El enlace vale 24 horas: da tiempo de abrir el correo sin dejarlo abierto para siempre.
const VIGENCIA_HORAS = 24;
// Espera entre envíos al mismo correo (cuida el límite diario de Resend).
const ESPERA_MS = 30_000;
const MAX_CONTACTOS = 10;

// Paso 1 de la baja directa: la persona escribe su correo y recibe un enlace (sin código).
// La respuesta es siempre la misma exista o no el correo, para no revelar quién es contacto de quién.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { email?: string } | null;
  const email = body?.email?.trim().toLowerCase();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ kind: "invalid_email" }, { status: 400 });
  }

  const admin = clienteAdmin();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (!admin || !baseUrl) return NextResponse.json({ kind: "error" }, { status: 500 });

  const { data: contacts } = await admin
    .from("contacts")
    .select("id, name, issuer_id")
    .ilike("email", email)
    .eq("status", "accepted")
    .order("created_at", { ascending: false })
    .limit(MAX_CONTACTOS);

  // Sin contactos con ese correo: se responde igual, sin enviar nada.
  if (!contacts?.length) return NextResponse.json({ kind: "ok" });

  const { data: recent } = await admin
    .from("contact_removals")
    .select("code_sent_at")
    .in("contact_id", contacts.map((c) => c.id))
    .not("code_sent_at", "is", null)
    .order("code_sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (recent?.code_sent_at && Date.now() - new Date(recent.code_sent_at).getTime() < ESPERA_MS) {
    return NextResponse.json({ kind: "ok" });
  }

  const ahora = new Date();
  const vence = new Date(ahora.getTime() + VIGENCIA_HORAS * 3_600_000);
  const issuerIds = [...new Set(contacts.map((c) => c.issuer_id))];
  const { data: profiles } = await admin.from("profiles").select("id, full_name").in("id", issuerIds);
  const nombreDe = new Map((profiles ?? []).map((p) => [p.id, p.full_name?.trim() || "esta persona"]));

  // Un enlace por cada persona de la que es contacto.
  const filas = contacts.map((c) => {
    const token = randomBytes(32).toString("base64url");
    return {
      contactId: c.id,
      token,
      hash: createHash("sha256").update(token).digest("hex"),
      emisor: nombreDe.get(c.issuer_id) ?? "esta persona",
    };
  });
  const { data: insertadas, error: insertError } = await admin
    .from("contact_removals")
    .insert(
      filas.map((f) => ({
        contact_id: f.contactId,
        request_token_hash: f.hash,
        code_hash: null,
        expires_at: vence.toISOString(),
        code_sent_at: ahora.toISOString(), // solo para espaciar envíos; ya no hay código
      })),
    )
    .select("id");
  if (insertError || !insertadas) return NextResponse.json({ kind: "error" }, { status: 500 });

  const brand = getBrand();
  try {
    await sendEmail({
      to: email,
      subject: `${brand.name}: tu enlace para dejar de ser contacto`,
      html: correoEnlace({
        marca: brand.name,
        color: brand.themeColor,
        nombre: contacts[0].name,
        enlaces: filas.map((f) => ({ emisor: f.emisor, url: `${baseUrl}/baja/${encodeURIComponent(f.token)}` })),
      }),
    });
  } catch (error) {
    console.error("[baja] no se pudo enviar el enlace:", error instanceof Error ? error.message : error);
    await admin.from("contact_removals").delete().in("id", insertadas.map((r) => r.id));
    return NextResponse.json({ kind: "error" }, { status: 502 });
  }

  return NextResponse.json({ kind: "ok" });
}

function escapar(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function correoEnlace({ marca, color, nombre, enlaces }: {
  marca: string;
  color: string;
  nombre: string;
  enlaces: { emisor: string; url: string }[];
}) {
  const botones = enlaces
    .map(
      (e) =>
        `<tr><td style="padding:0 24px 12px"><a href="${escapar(e.url)}" style="display:block;padding:14px 20px;border-radius:12px;background:${escapar(color)};color:#fff;text-align:center;text-decoration:none;font-weight:700">Dejar de ser contacto de ${escapar(e.emisor)}</a></td></tr>`,
    )
    .join("");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta http-equiv="Content-Language" content="es"></head>
  <body style="margin:0;background:#f5f5f5;font-family:Arial,sans-serif;color:#242424"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border-radius:16px"><tr><td style="padding:24px;font-size:18px;font-weight:700"><span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;background:${escapar(color)};color:#fff;margin-right:8px">${escapar(marca.slice(0, 1))}</span>${escapar(marca)}</td></tr>
  <tr><td style="padding:8px 24px"><h1 style="font-size:28px;line-height:36px">Tu enlace para dejar de ser contacto</h1><p style="font-size:16px;line-height:24px">Hola ${escapar(nombre)}. Toca el botón para continuar. Antes de terminar te pediremos que lo confirmes en pantalla.</p></td></tr>
  ${botones}
  <tr><td style="padding:8px 24px 24px;font-size:14px;line-height:20px;color:#555">El enlace vale ${VIGENCIA_HORAS} horas. Si no lo pediste, ignora este correo: no pasará nada.</td></tr></table>
  </td></tr></table></body></html>`;
}
