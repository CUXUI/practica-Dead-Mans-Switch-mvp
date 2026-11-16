import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getBrand } from "@/lib/brand";
import AlertaPantalla from "@/components/alerta/AlertaPantalla";
import type { DatosAlerta } from "@/components/alerta/tipos";

// Página pública de la alerta para quien recibe (flujo 5, R2 a R7). No tiene cuenta ni sesión.
// Los datos los entrega la función get_alert_view (migración 0013), que valida el token.
// Si el token no corresponde a ninguna alerta, responde 404. Todavía no registra "visto" (R3).

const TZ = "America/Argentina/Buenos_Aires";

function hora(fecha: Date): string {
  return fecha.toLocaleTimeString("es-AR", { hour: "numeric", minute: "2-digit", timeZone: TZ });
}

// "hoy a las 7:48 p. m.", "ayer a las 7:48 p. m." o la fecha completa.
function cuandoConfirmo(iso: string, ahora: Date): string {
  const fecha = new Date(iso);
  const dia = (d: Date) => d.toLocaleDateString("es-AR", { timeZone: TZ });
  if (dia(fecha) === dia(ahora)) return `hoy a las ${hora(fecha)}`;
  const ayer = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
  if (dia(fecha) === dia(ayer)) return `ayer a las ${hora(fecha)}`;
  return `el ${fecha.toLocaleDateString("es-AR", { day: "numeric", month: "long", timeZone: TZ })} a las ${hora(fecha)}`;
}

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

  const fila = data as FilaVista;
  const ahora = new Date();
  const datos: DatosAlerta = {
    estado: fila.estado,
    nombreQuienEmite: fila.nombre_quien_emite,
    telefonoQuienEmite: fila.telefono_quien_emite,
    minutosAbierta: Math.max(0, Math.round((ahora.getTime() - new Date(fila.iniciada_en).getTime()) / 60000)),
    horaDeberiaConfirmar: hora(new Date(fila.hora_deberia_confirmar)),
    ultimaConfirmacion: fila.ultima_confirmacion ? { cuando: cuandoConfirmo(fila.ultima_confirmacion, ahora) } : null,
    pasos: fila.pasos.map((p) => ({ orden: p.orden, texto: p.texto })),
  };

  const brand = getBrand();
  return <AlertaPantalla variant={brand.variant} datos={datos} nombreMarca={brand.name} />;
}
