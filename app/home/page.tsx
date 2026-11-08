import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBrand } from "@/lib/brand";
import SignOutButton from "@/components/auth/SignOutButton";
import TestEmailButton from "@/components/auth/TestEmailButton";
import NoticeForm from "@/components/notices/NoticeForm";
import PushButton from "@/components/pwa/PushButton";
import CancelarAlerta from "@/components/home/CancelarAlerta";
import { textosHome } from "@/components/home/textos";

// Placeholder del núcleo: solo confirma que registro, sesión y base de datos funcionan.
// El flujo "Home y confirmación" (E1, E2, E6) lo reemplaza. De momento solo está E6.
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ alerta?: string }>;
}) {
  const { alerta } = await searchParams;
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
  const textos = textosHome(brand.variant);

  // E6: con una alerta en curso, el home pide cancelarla (acción deliberada).
  const { data: enAlerta } = await supabase
    .from("v_my_notice")
    .select("id")
    .eq("state", "alert")
    .limit(1);
  const hayAlerta = (enAlerta?.length ?? 0) > 0;

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">{brand.name}</h1>
        <p className="text-text-muted">
          Hola{profile?.full_name ? `, ${profile.full_name}` : ""}. El núcleo está funcionando.
        </p>
      </header>

      {hayAlerta && (
        <section
          aria-labelledby="alerta-en-curso"
          className="space-y-3 rounded-lg border-2 border-danger bg-surface p-4"
        >
          <h2 id="alerta-en-curso" className="text-lg font-semibold">
            {textos.alertaTitulo}
          </h2>
          <p className="text-text-muted">{textos.alertaCuerpo}</p>
          <CancelarAlerta textos={textos} />
        </section>
      )}

      {!hayAlerta && alerta === "cancelada" && (
        <section role="status" className="space-y-1 rounded-lg border border-border bg-surface p-4">
          <h2 className="font-medium">{textos.canceladaTitulo}</h2>
          <p className="text-sm text-text-muted">{textos.canceladaCuerpo}</p>
        </section>
      )}

      <section className="space-y-1 rounded-lg bg-surface p-4">
        <h2 className="font-medium">Verificación del núcleo</h2>
        <p className="text-sm text-text-muted">Sesión: {user.email}</p>
        <p className="text-sm text-text-muted">
          Perfil en base de datos: {profile ? "sí" : "no encontrado (revisar migración)"}
        </p>
      </section>

      <TestEmailButton />
      <PushButton />

      <hr className="border-border" />

      <section className="space-y-3">
        <h2 className="font-medium">Probar Aviso</h2>
        <NoticeForm />
      </section>

      <SignOutButton />
    </main>
  );
}
