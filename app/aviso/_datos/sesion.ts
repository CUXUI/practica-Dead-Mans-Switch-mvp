// Solo servidor. El middleware del núcleo solo protege /home, así que las pantallas
// del flujo de quien emite comprueban la sesión aquí.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function exigirSesion() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export type Sesion = Awaited<ReturnType<typeof exigirSesion>>;

// Aviso más reciente de la persona (hay como máximo uno activo o en alerta).
export async function avisoActual(s: Sesion) {
  const { data } = await s.supabase
    .from("notices")
    .select("id, state, kind, recurrence, fire_at, grace_minutes")
    .eq("issuer_id", s.user.id)
    .order("created_at", { ascending: false });
  const avisos = data ?? [];
  // Si hay uno activo o en alerta, ese manda; si no, el apagado más reciente.
  return avisos.find((a) => a.state === "active" || a.state === "alert") ?? avisos[0] ?? null;
}
