import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getBrand } from "@/lib/brand";
import { clienteAdmin } from "@/lib/supabase/admin";
import { mensajeDeLaAlertaPorToken } from "@/lib/motor";
import AlertaPantalla from "@/components/alerta/AlertaPantalla";
import type { DatosAlerta } from "@/components/alerta/tipos";

// Página pública de la alerta para quien recibe (flujo 5, R2 a R7). No tiene cuenta ni sesión.
// Los datos los entrega la función get_alert_view (migración 0013), que valida el token.
// Si el token no corresponde a ninguna alerta, responde 404. Todavía no registra "visto" (R3).

type FilaVista = {
  estado: "enviada" | "alguien_la_vio" | "sin_respuesta" | "cerrada" | "sin_resolver";
  nombre_quien_emite: string;
  telefono_quien_emite: string | null;
  iniciada_en: string;
  hora_deberia_confirmar: string;
  ultima_confirmacion: string | null;
  pasos: { orden: number; texto: string }[];
};

export default async function AlertaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const tokenLimpio = decodeURIComponent(token);
  const { data, error } = await supabase.rpc("get_alert_view", { p_token: tokenLimpio });
  if (error) throw new Error("No pudimos abrir la alerta");
  if (!data) notFound();

  // R3: abrir la pantalla cuenta como visto. Si falla, la alerta igual se muestra.
  await supabase.rpc("registrar_vista_alerta", { p_token: tokenLimpio }).then(
    () => undefined,
    (e) => console.error("[alerta] no se pudo registrar la vista:", e)
  );

  // Mensaje opcional de quien emite. Si no se puede leer, la alerta se muestra igual, sin mensaje.
  const admin = clienteAdmin();
  const mensaje = admin ? await mensajeDeLaAlertaPorToken(admin, tokenLimpio).catch(() => null) : null;

  const fila = data as FilaVista;
  const ahora = new Date();
  const datos: DatosAlerta = {
    estado: fila.estado,
    nombreQuienEmite: fila.nombre_quien_emite,
    telefonoQuienEmite: fila.telefono_quien_emite,
    minutosAbierta: Math.max(0, Math.round((ahora.getTime() - new Date(fila.iniciada_en).getTime()) / 60000)),
    horaDeberiaConfirmarIso: fila.hora_deberia_confirmar,
    ultimaConfirmacionIso: fila.ultima_confirmacion,
    pasos: fila.pasos.map((p) => ({ orden: p.orden, texto: p.texto })),
    mensaje,
  };

  const brand = getBrand();
  return <AlertaPantalla variant={brand.variant} datos={datos} nombreMarca={brand.name} />;
}
