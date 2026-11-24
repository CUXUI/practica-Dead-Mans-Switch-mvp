import { boton as botonDS } from "@/components/ds/estilos";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBrand } from "@/lib/brand";
import Cabecera from "@/components/alta/Cabecera";
import { textosAlta } from "@/components/alta/textos";

// Onboarding · comienzo: resumen de los 3 pasos (flujo 1 · Alta de quien emite).
export default async function ListoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const textos = textosAlta(getBrand().variant).listo;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col p-6">
      <Cabecera />
      <h1 className="text-3xl font-bold leading-tight">{textos.titulo}</h1>
      <p className="mt-4 text-text-muted">{textos.cuerpo}</p>
      <ol className="mt-6 space-y-4 rounded-xl border border-borde-sutil bg-surface p-4">
        {textos.pasos.map((p, i) => (
          <li key={p.titulo} className="flex gap-3">
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-fondo-sutil text-sm font-semibold"
            >
              {i + 1}
            </span>
            <div>
              <p className="text-bloque">{p.titulo}</p>
              <p className="text-sm text-text-muted">{p.detalle}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-auto pt-8">
        <Link
          href="/alta/notificaciones"
          className={`${botonDS.principal}`}
        >
          {textos.empezar}
        </Link>
      </div>
    </main>
  );
}
