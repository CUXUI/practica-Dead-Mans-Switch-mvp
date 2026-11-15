"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Vuelve a pedir los datos de la pantalla sin recargarla: cada 20 s mientras se ve, y al volver
// a la pestaña o a la app (por ejemplo, tras aceptar la invitación desde el correo).
// No pinta nada y no pierde lo que haya en pantalla (diálogos abiertos, textos escritos).
export default function RefrescarSolo({ cadaSegundos = 20 }: { cadaSegundos?: number }) {
  const router = useRouter();

  useEffect(() => {
    const refrescar = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const id = setInterval(refrescar, cadaSegundos * 1000);
    document.addEventListener("visibilitychange", refrescar);
    window.addEventListener("focus", refrescar);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", refrescar);
      window.removeEventListener("focus", refrescar);
    };
  }, [router, cadaSegundos]);

  return null;
}
