import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBrand } from "@/lib/brand";
import SignOutButton from "@/components/auth/SignOutButton";
import TestEmailButton from "@/components/auth/TestEmailButton";

// Placeholder del núcleo: solo confirma que registro, sesión y base de datos funcionan.
// El flujo "Home y confirmación" (E1, E2, E6) lo reemplaza.
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .single();

  const brand = getBrand();

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">{brand.name}</h1>
        <p className="text-text-muted">
          Hola{profile?.full_name ? `, ${profile.full_name}` : ""}. El núcleo está funcionando.
        </p>
      </header>

      <section className="space-y-1 rounded-lg bg-surface p-4">
        <h2 className="font-medium">Verificación del núcleo</h2>
        <p className="text-sm text-text-muted">Sesión: {user.email}</p>
        <p className="text-sm text-text-muted">
          Perfil en base de datos: {profile ? "sí" : "no encontrado (revisar migración)"}
        </p>
      </section>

      <TestEmailButton />
      <SignOutButton />
    </main>
  );
}
