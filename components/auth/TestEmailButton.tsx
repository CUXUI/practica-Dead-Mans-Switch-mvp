"use client";

import { boton as botonDS } from "@/components/ds/estilos";
import { useState } from "react";

// Herramienta de verificación del núcleo. Se puede quitar cuando exista el flujo real de correos.
export default function TestEmailButton() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/test-email", { method: "POST" });
      const json = await res.json();
      setResult(json.ok ? "Correo enviado. Revisá tu bandeja." : `Error: ${json.error}`);
    } catch {
      setResult("Error de red al enviar la prueba.");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={send}
        disabled={loading}
        className={`${botonDS.principalAjustado}`}
      >
        {loading ? "Enviando…" : "Enviar correo de prueba"}
      </button>
      {result && <p role="status" className="text-sm">{result}</p>}
    </div>
  );
}
