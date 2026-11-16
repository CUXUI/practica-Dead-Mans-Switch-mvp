"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HoldButton from "@/components/home/HoldButton";
import { createClient } from "@/lib/supabase/client";
import type { TextosCuenta } from "./textos";

// Borrar la cuenta (E8) con acción deliberada: mantener 2 s (con lector de pantalla, botón y confirmación).
// Solo muestra el final cuando el servidor confirmó el borrado; si falla, lo dice y deja repetir (E1).
export default function BorrarCuenta({ t }: { t: TextosCuenta }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function borrar() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/cuenta/borrar", { method: "POST" });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? t.errorGenerico);
        setBusy(false);
        return;
      }
      // La sesión ya no existe en el servidor: se limpia la del navegador.
      await createClient().auth.signOut().catch(() => undefined);
      router.replace("/cuenta/borrada");
    } catch {
      setError(t.errorGenerico);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <HoldButton
        label={t.boton}
        help={t.ayudaMantener}
        confirmQuestion={t.confirmarPregunta}
        confirmYes={t.confirmarSi}
        confirmBack={t.volver}
        busyLabel={t.enviando}
        busy={busy}
        onComplete={borrar}
      />
      <p role="alert" className="text-sm font-medium text-danger">
        {error}
      </p>
    </div>
  );
}
