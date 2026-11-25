"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COOKIE_MARCA_COLOR, MARCAS_COLOR, type MarcaColor } from "@/lib/marca-color";
import type { TextosCuenta } from "./textos";

// Ajustes → Color de la app. Elige un color de marca y "Aplicar" lo guarda en una cookie del dispositivo
// y recarga la página para pintarla con ese color.
export default function SelectorMarca({ t, inicial }: { t: TextosCuenta; inicial: MarcaColor }) {
  const router = useRouter();
  const [elegida, setElegida] = useState<MarcaColor>(inicial);
  const [aplicada, setAplicada] = useState(false);

  const nombres: Record<MarcaColor, string> = { base: t.colorBase, cerca: t.colorCerca, montana: t.colorMontana };

  function aplicar() {
    // Un año. Path "/" para que aplique a toda la app.
    document.cookie = `${COOKIE_MARCA_COLOR}=${elegida}; path=/; max-age=31536000; samesite=lax`;
    setAplicada(true);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-espacio-m">
      <h2 className="text-xl font-semibold leading-7">{t.colorTitulo}</h2>
      <p className="text-base leading-6 text-text-muted">{t.colorTexto}</p>
      <fieldset className="flex flex-col gap-espacio-s">
        <legend className="sr-only">{t.colorTitulo}</legend>
        {MARCAS_COLOR.map((m) => (
          <label key={m} className="flex min-h-12 items-center gap-espacio-s text-base">
            <input
              type="radio"
              name="marca-color"
              value={m}
              checked={elegida === m}
              onChange={() => {
                setElegida(m);
                setAplicada(false);
              }}
              className="size-5 accent-brand-primary"
            />
            <span>{nombres[m]}</span>
          </label>
        ))}
      </fieldset>
      <button type="button" onClick={aplicar} className="min-h-12 rounded-[var(--spacing-radio-m)] bg-brand-primary px-espacio-xl font-bold text-brand-on-primary">
        {t.colorAplicar}
      </button>
      {aplicada && (
        <p role="status" className="text-sm text-text-muted">
          {t.colorAplicado}
        </p>
      )}
    </div>
  );
}
