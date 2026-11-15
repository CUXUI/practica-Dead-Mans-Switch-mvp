import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBrand } from "@/lib/brand";
import Cabecera from "@/components/alta/Cabecera";
import GuiaInstalacion from "@/components/alta/GuiaInstalacion";
import { textosAlta } from "@/components/alta/textos";

// E0 · Agregar la app a la pantalla de inicio (flujo 1 · Alta de quien emite).
export default async function InstalarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const textos = textosAlta(getBrand().variant).instalar;

  return (
    <main className="mx-auto max-w-md p-6">
      <Cabecera />
      <GuiaInstalacion textos={textos} />
    </main>
  );
}
