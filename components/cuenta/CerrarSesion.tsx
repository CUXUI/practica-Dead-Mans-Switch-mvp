"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { boton } from "./estilos";

// Cerrar sesión con el Action Button Secundario de la Biblioteca.
export default function CerrarSesion({ texto }: { texto: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={boton.secundario}
      onClick={async () => {
        await createClient().auth.signOut();
        router.push("/login");
        router.refresh();
      }}
    >
      {texto}
    </button>
  );
}
