import type { Metadata } from "next";
import { getBrand } from "@/lib/brand";
import InicioBaja from "@/components/baja/InicioBaja";

export const metadata: Metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function SolicitarBajaPage() {
  return <InicioBaja marca={getBrand().name} />;
}
