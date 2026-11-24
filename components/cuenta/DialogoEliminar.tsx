"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconoAlerta } from "@/components/historial/iconos";
import BotonMantener from "./BotonMantener";
import { boton } from "./estilos";
import type { TextosCuenta } from "./textos";

// Eliminar la cuenta (E8): botón que abre el Diálogo de confirmación · Destructiva de la Biblioteca.
// El botón principal dice exactamente lo que va a pasar y pide una acción deliberada (mantener 2 s);
// Cancelar siempre está. role="alertdialog": el foco entra al abrir, vuelve al botón al cerrar y Esc cierra.
// El fondo oscurecido (negro al 45 %) va aquí, en la pantalla, no en el diálogo.
// Solo muestra el final cuando el servidor confirmó el borrado; si falla, lo dice y deja repetir (E1).
export default function DialogoEliminar({ t }: { t: TextosCuenta }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abridor = useRef<HTMLButtonElement>(null);
  const dialogo = useRef<HTMLDivElement>(null);
  const cancelar = useRef<HTMLButtonElement>(null);

  function cerrar() {
    if (busy) return;
    setAbierto(false);
    setError(null);
    abridor.current?.focus();
  }

  // El foco entra al diálogo al abrirse.
  useEffect(() => {
    if (abierto) dialogo.current?.focus();
  }, [abierto]);

  function alTeclear(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      cerrar();
      return;
    }
    // El foco no sale del diálogo mientras está abierto.
    if (e.key === "Tab" && dialogo.current) {
      const foco = Array.from(dialogo.current.querySelectorAll<HTMLElement>("button:not(:disabled)"));
      if (foco.length === 0) return;
      const primero = foco[0];
      const ultimo = foco[foco.length - 1];
      if (e.shiftKey && (document.activeElement === primero || document.activeElement === dialogo.current)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }
  }

  async function eliminar() {
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
    <>
      <button ref={abridor} type="button" onClick={() => setAbierto(true)} className={boton.secundario}>
        {t.abrirDialogo}
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-negro/45 p-espacio-l" onKeyDown={alTeclear}>
          <div
            ref={dialogo}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="dialogo-titulo"
            aria-describedby="dialogo-texto"
            tabIndex={-1}
            className="flex max-h-full w-full max-w-[340px] flex-col gap-espacio-m overflow-y-auto rounded-[var(--spacing-radio-l)] bg-surface p-espacio-xl outline-none"
          >
            <IconoAlerta />
            <h2 id="dialogo-titulo" className="text-tarjeta leading-7">
              {t.dialogoTitulo}
            </h2>
            <p id="dialogo-texto" className="text-base leading-6 text-text-muted">
              {t.dialogoTexto}
            </p>
            <div className="flex flex-col gap-espacio-s">
              <BotonMantener label={t.boton} ayuda={t.ayudaMantener} busyLabel={t.enviando} busy={busy} onComplete={eliminar} />
              <button ref={cancelar} type="button" onClick={cerrar} disabled={busy} className={boton.secundario}>
                {t.cancelar}
              </button>
            </div>
            <p role="alert" className="text-sm font-medium leading-[21px] text-danger">
              {error}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
