import { getBrand } from "@/lib/brand";
import { EnlaceBoton, Pantalla } from "@/components/emisor/ui";
import { textosCuenta } from "@/components/cuenta/textos";

// Pantalla pública final de E8: ya no hay sesión ni datos. Informa y acompaña; no celebra.
export async function generateMetadata() {
  return { title: textosCuenta(getBrand().variant).borradaTitulo };
}

export default function CuentaBorrada() {
  const t = textosCuenta(getBrand().variant);
  return (
    <Pantalla pie={<EnlaceBoton href="/login">{t.borradaIr}</EnlaceBoton>}>
      <h1 className="text-2xl font-semibold">{t.borradaTitulo}</h1>
      <p className="text-text-muted">{t.borradaTexto}</p>
    </Pantalla>
  );
}
