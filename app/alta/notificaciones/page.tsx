import { getBrand } from "@/lib/brand";
import { textosAlta } from "@/components/alta/textos";
import ActivarNotificaciones from "@/components/alta/ActivarNotificaciones";
import { exigirSesion } from "@/app/aviso/_datos/sesion";

// R-AV-E1 · Web · Onboarding · activar notificaciones / notificaciones activas / no activó
export default async function AltaNotificaciones() {
  await exigirSesion();
  const t = textosAlta(getBrand().variant).notificaciones;
  return <ActivarNotificaciones t={t} />;
}
