import { getBrand } from "@/lib/brand";
import { MarcaApp } from "@/components/ds/Navegacion";

// Cabecera de marca de las pantallas del alta: la Marca de la app del design system (logo + nombre),
// la misma que usan el Encabezado, la baja y la landing. Así el logo es uno solo en todo el producto.
export default function Cabecera() {
  const brand = getBrand();
  return (
    <header className="mb-6 flex items-center">
      <MarcaApp nombre={brand.name} />
    </header>
  );
}
