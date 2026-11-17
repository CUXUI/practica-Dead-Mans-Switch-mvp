import { Resend } from "resend";

// Solo servidor. Nunca importar desde un componente "use client".
export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Falta RESEND_API_KEY");

  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const html = declararEspanol(opts.html);

  const { data, error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html,
    headers: {
      "Content-Language": "es",
    },
  });

  if (error) throw new Error(error.message);
  return data;
}

function declararEspanol(html: string) {
  if (/<html[\s>]/i.test(html)) {
    let normalizado = html.replace(/<html(?![^>]*\blang=)/i, '<html lang="es"');
    if (!/charset=/i.test(normalizado)) normalizado = normalizado.replace(/<head>/i, '<head><meta charset="utf-8">');
    if (!/content-language/i.test(normalizado)) {
      normalizado = normalizado.replace(/<head>/i, '<head><meta http-equiv="Content-Language" content="es">');
    }
    return normalizado;
  }
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta http-equiv="Content-Language" content="es"></head><body>${html}</body></html>`;
}
