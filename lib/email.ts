import { Resend } from "resend";

// Solo servidor. Nunca importar desde un componente "use client".
export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Falta RESEND_API_KEY");

  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

  const { data, error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });

  if (error) throw new Error(error.message);
  return data;
}
