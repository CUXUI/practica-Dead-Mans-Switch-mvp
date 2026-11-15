import type { Metadata } from "next";
import { getBrand } from "@/lib/brand";
import AceptarContacto from "@/components/invitacion/AceptarContacto";

// Página pública de quien recibe la invitación (R1). No requiere sesión: /invitacion no está
// en PRIVATE_PREFIXES. El token va en la URL, por eso no se indexa ni se envía como referrer.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function InvitacionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const brand = getBrand();
  return <AceptarContacto token={decodeURIComponent(token)} marca={brand.name} variant={brand.variant} />;
}
