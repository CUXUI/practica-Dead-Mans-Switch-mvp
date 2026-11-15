import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBrand } from "@/lib/brand";
import PasoNotificaciones from "@/components/alta/PasoNotificaciones";
import { textosAlta } from "@/components/alta/textos";

// Onboarding · Paso 1 de 3: notificaciones (flujo 1 · Alta de quien emite).
export default async function NotificacionesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const textos = textosAlta(getBrand().variant).notificaciones;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col p-6">
      <PasoNotificaciones textos={textos} />
    </main>
  );
}
