import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBrand } from "@/lib/brand";
import RegistroForm from "@/components/alta/RegistroForm";
import { textosAlta } from "@/components/alta/textos";
import { IconoVolver } from "@/components/alta/iconos";

// E0 · Crear la cuenta (flujo 1 · Alta de quien emite).
export default async function RegistroAltaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/home");

  const textos = textosAlta(getBrand().variant).registro;

  return (
    <main className="mx-auto max-w-md p-6">
      <header className="mb-6 flex items-center gap-2">
        <Link
          href="/alta"
          aria-label={textos.volver}
          className="-ml-2 flex size-11 items-center justify-center rounded-lg"
        >
          <IconoVolver className="size-6" />
        </Link>
        <h1 className="text-tarjeta">{textos.titulo}</h1>
      </header>
      <RegistroForm textos={textos} />
      <p className="mt-6 text-sm">
        {textos.yaTienesCuenta}{" "}
        <Link href="/login" className="font-semibold text-brand-primary underline">
          {textos.iniciarSesion}
        </Link>
      </p>
    </main>
  );
}
