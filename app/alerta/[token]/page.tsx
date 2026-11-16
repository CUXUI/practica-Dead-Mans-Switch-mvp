import { notFound } from "next/navigation";
import { getBrand } from "@/lib/brand";
import AlertaPantalla from "@/components/alerta/AlertaPantalla";
import type { DatosAlerta } from "@/components/alerta/tipos";

// Página pública de la alerta para quien recibe (flujo 5, R2 a R7). No tiene cuenta ni sesión.
//
// PENDIENTE DEL NÚCLEO: validar el token y leer la alerta con una función que valide el token
// (ESQUEMA.md, "Funciones security definer"). Mientras tanto, esta página usa datos de prueba
// y solo funciona en desarrollo. En producción responde 404 para no mostrar datos falsos.
// Tampoco registra "visto" todavía (R3): eso también lo hace el núcleo al abrir la página.

const DATOS_DE_PRUEBA: DatosAlerta = {
  estado: "abierta",
  nombreQuienEmite: "Mariana",
  telefonoQuienEmite: "5491100000000",
  minutosAbierta: 45,
  horaDeberiaConfirmar: "8:00 p. m.",
  ultimaConfirmacion: { cuando: "ayer a las 7:48 p. m." },
  pasos: [
    {
      orden: 1,
      texto: "Llámame y escríbeme por WhatsApp",
      detalle: "Si no contesto en 10 minutos, sigue con el paso 2.",
    },
    {
      orden: 2,
      texto: "Llama a Carlos, mi vecino",
    },
  ],
};

export default async function AlertaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  await params; // el token se validará cuando el núcleo entregue la función

  const brand = getBrand();
  return (
    <AlertaPantalla
      variant={brand.variant}
      datos={DATOS_DE_PRUEBA}
      nombreMarca={brand.name}
    />
  );
}
