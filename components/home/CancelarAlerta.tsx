"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HoldButton from "./HoldButton";
import { proximoPlazo } from "@/app/aviso/_datos/formato";
import type { Frecuencia } from "@/app/aviso/_datos/tipos";
import type { TextosHome } from "./textos";

// Cancelar una falsa alarma (E6). Solo muestra el resultado cuando el servidor lo confirmó:
// si la petición falla, avisa que NO se canceló y deja repetir (E1).
// plazo: lo que hace falta para calcular, con la zona horaria de la persona, cuándo toca el próximo aviso
// si la rutina sigue ("A diario" o "Elegir días"). Con "Solo hoy" no se usa.
export default function CancelarAlerta({
  textos,
  plazo,
}: {
  textos: TextosHome;
  plazo?: { fireAt: string; frecuencia: Frecuencia; dias: number[] };
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Próximo plazo desde ahora, en la hora local del navegador (la hora del aviso no cambia).
  function calcularProximo(): string | null {
    if (!plazo || plazo.frecuencia === "once") return null;
    const actual = new Date(plazo.fireAt);
    const hhmm = `${String(actual.getHours()).padStart(2, "0")}:${String(actual.getMinutes()).padStart(2, "0")}`;
    return proximoPlazo(hhmm, plazo.frecuencia, plazo.dias)?.toISOString() ?? null;
  }

  async function cancelar() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/alerta/cancelar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proximo: calcularProximo() }),
      });
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
