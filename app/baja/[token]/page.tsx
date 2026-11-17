import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { getBrand } from "@/lib/brand";
import FlujoBaja from "@/components/baja/FlujoBaja";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type Lookup = {
  issuer_name: string;
  contact_email_masked: string;
  removal_state: "ready" | "confirmed" | "inactive";
  has_open_alert: boolean;
};

export default async function BajaPage({ params }: { params: Promise<{ token: string }> }) {
  const { token: encoded } = await params;
  const token = decodeURIComponent(encoded);
  const brand = getBrand();
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const { data, error } = await anon.rpc("get_contact_removal", { p_token: token });
  const row = !error && Array.isArray(data) ? (data[0] as Lookup | undefined) : undefined;
  return (
    <FlujoBaja
      token={token}
      marca={brand.name}
      emisor={row?.issuer_name ?? ""}
      correoOculto={row?.contact_email_masked ?? ""}
      estadoInicial={row?.removal_state ?? "inactive"}
      alertaInicial={row?.has_open_alert ?? false}
    />
  );
}
