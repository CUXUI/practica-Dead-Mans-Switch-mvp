import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { getBrand } from "@/lib/brand";

// POST /api/test-email
// Envía un correo de prueba al correo de registro de la persona logueada.
// Requiere dominio verificado en Resend (avisos.comunidaduxui.com).
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
  }

  const to = user.email;

  const brand = getBrand();

  try {
    const data = await sendEmail({
      to,
      subject: `[Prueba] ${brand.name}: el envío de correo funciona`,
      html: `<p>Este es un correo de prueba de <strong>${brand.name}</strong>.</p>
             <p>Si lo ves, Resend está bien configurado.</p>`,
    });
    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
