import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";
import { sendPushToUser } from "@/lib/push";
import { getBrand } from "@/lib/brand";

// POST /api/invitacion/responder  { token, decision: "accept" | "reject" }
// Quien recibe no tiene cuenta: valida el token con respond_invitation (migración 0012)
// y después avisa a quien emite por correo y push.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { token?: string; decision?: string } | null;
  const token = body?.token;
  const decision = body?.decision;
  if (!token || (decision !== "accept" && decision !== "reject")) {
    return NextResponse.json({ kind: "inactive" }, { status: 400 });
  }

  // Sin sesión: la función es security definer y valida el token.
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const { data, error } = await anon.rpc("respond_invitation", { p_token: token, p_decision: decision });
  if (error) {
    return NextResponse.json({ kind: "inactive" }, { status: 500 });
  }
  const row = Array.isArray(data) ? data[0] : null;
  if (!row || row.result === "not_found" || row.result === "inactive") {
    return NextResponse.json({ kind: "inactive" });
  }

  // Avisar a quien emite. Si el aviso falla, la respuesta ya quedó guardada: no se revierte.
  const newStatus = row.new_status as "accepted" | "rejected";
  await avisarAQuienEmite(row.issuer_id as string, row.contact_email as string, newStatus).catch(() => undefined);

  return NextResponse.json({ kind: "ok", status: newStatus });
}

async function avisarAQuienEmite(issuerId: string, contactEmail: string, status: "accepted" | "rejected") {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return;
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { persistSession: false },
  });
  const { data: userData } = await admin.auth.admin.getUserById(issuerId);
  const to = userData?.user?.email;
  const brand = getBrand();
  const aceptó = status === "accepted";

  const titulo = aceptó
    ? `${contactEmail} aceptó ser tu contacto`
    : `${contactEmail} no puede ser tu contacto por ahora`;
  const cuerpo = aceptó
    ? "Ya puede recibir un aviso si dejás de confirmar que estás bien."
    : "Podés invitar a otra persona desde la app.";

  if (to) {
    await sendEmail({
      to,
      subject: `${brand.name}: ${titulo}`,
      html: `<p>${titulo}.</p><p>${cuerpo}</p>`,
    });
  }
  await sendPushToUser(admin, issuerId, { title: brand.name, body: titulo, url: "/contactos" }).catch(() => undefined);
}
