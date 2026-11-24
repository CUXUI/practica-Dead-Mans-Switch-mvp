import Link from "next/link";
import { getBrand } from "@/lib/brand";
import { Pantalla } from "@/components/emisor/ui";
import { boton } from "@/components/cuenta/estilos";
import { textosCuenta } from "@/components/cuenta/textos";

// Pantalla pública final de E8: ya no hay sesión ni datos. Informa y acompaña; no celebra.
export async function generateMetadata() {
  return { title: textosCuenta(getBrand().variant).borradaTitulo };
}

export default function CuentaBorrada() {
  const t = textosCuenta(getBrand().variant);
  return (
    <Pantalla
      pie={
        <Link href="/login" className={boton.principal}>
          {t.borradaIr}
        </Link>
      }
    >
      <h1 className="text-seccion leading-8">{t.borradaTitulo}</h1>
      <p className="text-base leading-6 text-text-muted">{t.borradaTexto}</p>
    </Pantalla>
  );
}
