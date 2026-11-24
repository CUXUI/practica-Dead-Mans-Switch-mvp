"use client";

import { boton as botonDS } from "@/components/ds/estilos";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { TextosAlta } from "@/components/alta/textos";
import {
  alCambiarAviso,
  avisoInstalacion,
  consumirAviso,
  detectarPlataforma,
  estaInstalada,
  type Plataforma,
} from "@/components/alta/instalacion";

// E0 · Guía para agregar la app a inicio. iPhone: pasos de Safari. Android: botón de instalar
// (o pasos del menú si el navegador no ofrece el botón). Nunca bloquea: se puede seguir en el navegador.

// Paso siguiente del alta: el resumen de los 3 pasos.
const SIGUIENTE = "/alta/listo";

type Paso = { titulo: string; detalle: string };

function ListaPasos({ pasos }: { pasos: Paso[] }) {
  return (
    <ol className="space-y-4 rounded-xl border border-borde-sutil bg-surface p-4">
      {pasos.map((p, i) => (
        <li key={p.titulo} className="flex gap-3">
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-fondo-sutil text-sm font-semibold"
          >
            {i + 1}
          </span>
          <div>
            <p className="font-semibold">{p.titulo}</p>
            <p className="text-sm text-text-muted">{p.detalle}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function GuiaInstalacion({ textos }: { textos: TextosAlta["instalar"] }) {
  const router = useRouter();
  const [plataforma, setPlataforma] = useState<Plataforma | null>(null);
  const [hayBoton, setHayBoton] = useState(false);
  const [instalada, setInstalada] = useState(false);

  useEffect(() => {
    if (estaInstalada()) {
      router.replace(SIGUIENTE);
      return;
    }
    setPlataforma(detectarPlataforma());
    setHayBoton(!!avisoInstalacion());
    return alCambiarAviso(() => setHayBoton(!!avisoInstalacion()));
  }, [router]);

  async function instalar() {
    const aviso = avisoInstalacion();
    if (!aviso) return;
    await aviso.prompt();
    const { outcome } = await aviso.userChoice;
    consumirAviso();
    setHayBoton(false);
    if (outcome === "accepted") setInstalada(true);
  }

  if (!plataforma) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-seccion leading-tight">{textos.titulo}</h1>
        <p className="mt-2 text-text-muted">{textos.cuerpo}</p>
      </div>

      {instalada ? (
        <div role="status" className="rounded-xl border border-borde-sutil bg-surface p-4">
          <p className="font-semibold">{textos.instaladaTitulo}</p>
          <p className="mt-1 text-sm text-text-muted">{textos.instaladaCuerpo}</p>
        </div>
      ) : plataforma === "ios" ? (
        <>
          <ListaPasos pasos={textos.iosPasos} />
          <p className="text-sm text-text-muted">{textos.iosOtroNavegador}</p>
        </>
      ) : hayBoton ? (
        <button
          type="button"
          onClick={instalar}
          className={`${botonDS.principal}`}
        >
          {textos.androidBoton}
        </button>
      ) : plataforma === "android" ? (
        <ListaPasos pasos={textos.androidPasos} />
      ) : (
        <p className="rounded-xl border border-borde-sutil bg-surface p-4 text-text-muted">{textos.escritorioCuerpo}</p>
      )}

      <button
        type="button"
        onClick={() => router.push(SIGUIENTE)}
        className={`${botonDS.secundario}`}
      >
        {textos.continuar}
      </button>
    </div>
  );
}
