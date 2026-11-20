import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { clienteAdmin } from "@/lib/supabase/admin";

// POST /api/recuperar/confirmar  { token, password }
// Valida el enlace (una sola vez, dentro de la hora) y cambia la contraseña.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { token?: string; password?: string } | null;
  const token = body?.token ?? "";
  const password = body?.password ?? "";
  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: "La contraseña tiene que tener al menos 8 caracteres." }, { status: 400 });
  }
  if (!token) {
    return NextResponse.json({ ok: false, error: "El enlace no es válido." }, { status: 400 });
  }

  const admin = clienteAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "No pudimos cambiar la contraseña." }, { status: 500 });

  const hash = createHash("sha256").update(token).digest("hex");

  // Marcar el enlace como usado de forma atómica: solo una petición puede ganar.
  const { data: usado, error: errorUso } = await admin
    .from("password_resets")
    .update({ used_at: new Date().toISOString() })
    .eq("token_hash", hash)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("user_id")
    .maybeSingle();
  if (errorUso || !usado) {
    return NextResponse.json({ ok: false, error: "El enlace no es válido o ya venció. Pide uno nuevo." }, { status: 400 });
  }

  const { error } = await admin.auth.admin.updateUserById(usado.user_id as string, { password });
  if (error) {
    return NextResponse.json({ ok: false, error: "No pudimos cambiar la contraseña. Pide un enlace nuevo." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
