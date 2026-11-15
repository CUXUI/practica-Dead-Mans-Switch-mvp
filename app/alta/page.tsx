import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBrand } from "@/lib/brand";
import Cabecera from "@/components/alta/Cabecera";
import { textosAlta } from "@/components/alta/textos";

// R1-E1 · Inicio de la web app (flujo 1 · Alta de quien emite).
export default async function InicioAltaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/home");

  const textos = textosAlta(getBrand().variant).inicio;

  return (
    <main className="mx-auto max-w-md p-6">
      <Cabecera />
      <h1 className="text-3xl font-bold leading-tight">{textos.titulo}</h1>
      <p className="mt-4 text-text-muted">{textos.cuerpo}</p>
      <h2 className="mt-8 text-lg font-semibold">{textos.pregunta}</h2>
      <div className="mt-3 space-y-3">
        <Link
          href="/login"
          className="flex min-h-12 w-full items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 font-semibold"
        >
          {textos.siIniciarSesion}
        </Link>
        <Link
          href="/alta/registro"
          className="flex min-h-12 w-full items-center justify-center rounded-lg bg-brand-primary px-4 py-2 font-semibold text-brand-on-primary"
        >
          {textos.noCrearCuenta}
        </Link>
      </div>
    </main>
  );
}
