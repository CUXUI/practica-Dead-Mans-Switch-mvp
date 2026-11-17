"use client";

import { useEffect, useState } from "react";
import { DIAS, horaCorta } from "@/app/aviso/_datos/formato";
import { rellenar } from "@/components/aviso/textos";
import type { TextosInicio } from "./textosInicio";

// Resultado de "Estoy bien" (E1): la hora en que el SERVIDOR guardó la confirmación (se lee de la base,
// no del teléfono) y el próximo plazo. Con "Solo hoy" no hay próximo plazo: el aviso quedó apagado.
// Las horas se formatean en el navegador (zona horaria de la persona), igual que PlazoActivo.
// La región role="status" existe vacía primero y el texto entra después, para que el lector la anuncie.

const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

// "hoy", "mañana", "el viernes" (dentro de la semana) o "el 24/11".
function dia(fecha: Date, t: TextosInicio["confirmado"], ahora = new Date()): string {
  const inicio = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dias = Math.round((inicio(fecha) - inicio(ahora)) / 86_400_000);
  if (dias === 0) return t.hoy;
  if (dias === 1) return t.manana;
  if (dias > 1 && dias < 7) return rellenar(t.elDia, { dia: DIAS.find((d) => d.valor === fecha.getDay())?.nombre ?? "" });
  return rellenar(t.elDia, { dia: `${fecha.getDate()}/${fecha.getMonth() + 1}` });
}

// "a las 8:05 p. m." · "a la 1:05 p. m."
function aLas(fecha: Date, t: TextosInicio["confirmado"]): string {
  const hora = horaCorta(hhmm(fecha));
  return rellenar(fecha.getHours() % 12 === 1 ? t.aLa : t.aLas, { hora });
}

// La hora termina en "a. m." / "p. m.": si la frase también cierra con punto, queda uno solo.
const unPunto = (texto: string) => texto.replace(/\.\.$/, ".");

export default function ConfirmacionHecha({
  t,
  confirmadoEn,
  proximo,
  quitarParametro = "confirmado",
}: {
  t: TextosInicio;
  confirmadoEn: string;
  // Próximo plazo (ISO). null: el aviso era "Solo hoy" y quedó apagado.
  proximo: string | null;
  quitarParametro?: string;
}) {
  const [listo, setListo] = useState(false);

  useEffect(() => {
    // Al verse se limpia la dirección (?confirmado=1) para que no reaparezca al recargar.
    const url = new URL(window.location.href);
    url.searchParams.delete(quitarParametro);
    window.history.replaceState(null, "", url.pathname + url.search);
    const id = setTimeout(() => setListo(true), 50);
    return () => clearTimeout(id);
  }, [quitarParametro]);

  const tc = t.confirmado;
  const cuando = new Date(confirmadoEn);
  const siguiente = proximo ? new Date(proximo) : null;

  return (
    <div role="status">
      {listo && (
        <div className="flex items-start gap-3 rounded-lg border-2 border-success bg-surface p-4">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 size-5 shrink-0 text-success" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12l5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="space-y-1">
            <p className="font-semibold">{tc.titulo}</p>
            <p className="text-sm">{unPunto(rellenar(tc.registrada, { cuando: `${dia(cuando, tc)} ${aLas(cuando, tc)}` }))}</p>
            <p className="text-sm">
              {siguiente ? unPunto(rellenar(tc.proximo, { cuando: `${dia(siguiente, tc)} ${aLas(siguiente, tc)}` })) : tc.soloHoy}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
