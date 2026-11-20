import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import { clienteAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { getBrand } from "@/lib/brand";
import { appUrl } from "@/lib/motor";

// POST /api/recuperar  { email }
// Pide el enlace para cambiar la contraseña. Responde siempre lo mismo, exista o no el correo,
// para no revelar qué correos están registrados.
export const runtime = "nodejs";

const VENCE_MS = 60 * 60 * 1000; // 1 hora
const MAX_PEDIDOS_POR_HORA = 3;

const RESPUESTA = { ok: true };

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { email?: string } | null;
  const email = body?.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) return NextResponse.json(RESPUESTA);

  const admin = clienteAdmin();
  const base = appUrl();
  if (!admin || !base) return NextResponse.json(RESPUESTA);

  const { data: userId } = await admin.rpc("id_usuario_por_correo", { p_email: email });
  if (!userId) return NextResponse.json(RESPUESTA);

  // Límite: como mucho MAX_PEDIDOS_POR_HORA enlaces por persona por hora.
  const desde = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("password_resets")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", desde);
  if ((count ?? 0) >= MAX_PEDIDOS_POR_HORA) return NextResponse.json(RESPUESTA);

  const token = randomBytes(32).toString("base64url");
  const hash = createHash("sha256").update(token).digest("hex");
  const { error } = await admin.from("password_resets").insert({
    user_id: userId,
    token_hash: hash,
    expires_at: new Date(Date.now() + VENCE_MS).toISOString(),
  });
  if (error) return NextResponse.json(RESPUESTA);

  const marca = getBrand();
  const enlace = `${base}/recuperar/nueva?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to: email,
    subject: `${marca.name}: cambiar tu contraseña`,
    html: `<p>Recibimos un pedido para cambiar tu contraseña de ${marca.name}.</p>
           <p><a href="${enlace}">Elegir una contraseña nueva</a></p>
           <p>El enlace vence en 1 hora. Si no lo pediste, ignora este correo: tu contraseña no cambia.</p>`,
  }).catch((e) => console.error("[recuperar] no se pudo enviar el correo:", e));

  return NextResponse.json(RESPUESTA);
}
