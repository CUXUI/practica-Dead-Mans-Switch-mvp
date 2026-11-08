"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HoldButton from "./HoldButton";
import type { TextosHome } from "./textos";

// Cancelar una falsa alarma (E6). Solo muestra el resultado cuando el servidor lo confirmó:
// si la petición falla, avisa que NO se canceló y deja repetir (E1).
export default function CancelarAlerta({ textos }: { textos: TextosHome }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancelar() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/alerta/cancelar", { method: "POST" });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? textos.errorGenerico);
        setBusy(false);
        return;
      }
      router.replace("/home?alerta=cancelada");
      router.refresh();
    } catch {
      setError(textos.errorGenerico);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <HoldButton
        label={textos.boton}
        help={textos.ayudaMantener}
        confirmQuestion={textos.confirmarPregunta}
        confirmYes={textos.confirmarSi}
        confirmBack={textos.volver}
        busyLabel={textos.enviando}
        busy={busy}
        onComplete={cancelar}
      />
      <p role="status" className="text-sm text-danger">
        {error}
      </p>
    </div>
  );
}
