import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { clienteAdmin } from "@/lib/supabase/admin";
import { cancelarProgramado } from "@/app/aviso/_datos/qstash";
import { sendEmail } from "@/lib/email";
import { sendPushToUser } from "@/lib/push";
import { getBrand } from "@/lib/brand";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { token?: string; code?: string; force?: boolean } | null;
  const token = body?.token?.trim();
  const code = body?.code?.replace(/\D/g, "");
  if (!token || !code || code.length !== 6) {
    return NextResponse.json({ kind: "invalid_code" }, { status: 400 });
  }

  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const { data, error } = await anon.rpc("confirm_contact_removal", {
    p_token: token,
    p_code: code,
    p_force: body?.force === true,
  });
  if (error) {
    console.error("[baja] la función de confirmación falló:", error.message);
    return NextResponse.json({ kind: "error" }, { status: 500 });
  }
  const row = Array.isArray(data) ? data[0] : null;
  const kind = row?.result as string | undefined;
  if (!row || !kind) return NextResponse.json({ kind: "inactive" });
  if (kind !== "ok") return NextResponse.json({ kind });

  await Promise.allSettled(((row.qstash_message_ids as string[] | null) ?? []).map((id) => cancelarProgramado(id)));
  await avisarEmisor(row.issuer_id as string, row.contact_name as string).catch(() => undefined);
  return NextResponse.json({ kind: "ok" });
}

async function avisarEmisor(issuerId: string, contactName: string) {
  const admin = clienteAdmin();
  if (!admin) return;
  const { data } = await admin.auth.admin.getUserById(issuerId);
  const to = data?.user?.email;
  const brand = getBrand();
  const title = `${contactName} dejó de ser tu contacto`;
  if (to) {
    await sendEmail({
      to,
      subject: `${brand.name}: ${title}`,
      html: `<p>${escapar(title)}.</p><p>Ya no recibirá tus alertas. Puedes invitar a otra persona desde la app.</p>`,
    });
  }
  await sendPushToUser(admin, issuerId, { title: brand.name, body: title, url: "/contactos" }).catch(() => undefined);
}

function escapar(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
