import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Destino de los enlaces que envía Supabase: confirmación de correo y recuperación de contraseña.
// next: a dónde ir después (solo rutas internas, por ejemplo /recuperar/nueva). Por defecto, /home.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const destino = next && next.startsWith("/") && !next.startsWith("//") ? next : "/home";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${destino}`);
  }
  return NextResponse.redirect(`${origin}/login?error=confirmacion`);
}
