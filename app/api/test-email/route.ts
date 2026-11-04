import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { getBrand } from "@/lib/brand";

// POST /api/test-email
// Envía un correo de prueba. Requiere sesión iniciada.
// Mientras no haya dominio verificado en Resend, el plan gratis solo entrega
// al correo dueño de la cuenta de Resend: ese correo va en TEST_EMAIL_TO.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
  }

  const to = process.env.TEST_EMAIL_TO;
  if (!to) {
    return NextResponse.json(
      { ok: false, error: "Falta TEST_EMAIL_TO en las variables de entorno" },
      { status: 500 }
    );
  }

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
