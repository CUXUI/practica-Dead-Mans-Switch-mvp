import Image from "next/image";
import { getBrand } from "@/lib/brand";

// Cabecera de marca de las pantallas del alta: ícono + nombre de la app.
export default function Cabecera() {
  const brand = getBrand();
  return (
    <header className="mb-6 flex items-center gap-2">
      <Image src="/icons/icon-192.png" alt="" width={32} height={32} className="rounded-full" />
      <span className="font-semibold">{brand.name}</span>
    </header>
  );
}
