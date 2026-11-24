"use client";

import { boton as botonDS } from "@/components/ds/estilos";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TextosAlta } from "@/components/alta/textos";
import { detectarPlataforma, estaInstalada, type Plataforma } from "@/components/alta/instalacion";
import { guardarSuscripcion, permisoActual, pushDisponible } from "@/components/alta/push";
import { IconoCampana, IconoCampanaTachada, IconoCargando } from "@/components/alta/iconos";

// Onboarding · Paso 1 de 3: notificaciones. Estados de los wireframes: pedir, activas y
// desactivadas. Si las rechaza, se explica para qué sirven, que recibirá solo correo, y sigue.

// Paso 2 de 3: primer contacto (/contactos/nuevo, en modo alta).
const SIGUIENTE = "/contactos/nuevo";

type Estado = "cargando" | "pedir" | "activas" | "desactivadas" | "ios-sin-instalar";

export default function PasoNotificaciones({ textos }: { textos: TextosAlta["notificaciones"] }) {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("cargando");
  const [plataforma, setPlataforma] = useState<Plataforma>("escritorio");
  const [activando, setActivando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nuncaPreguntado, setNuncaPreguntado] = useState(false);

  async function revisar() {
    const p = detectarPlataforma();
    setPlataforma(p);
    if (!pushDisponible()) {
      setEstado(p === "ios" && !estaInstalada() ? "ios-sin-instalar" : "desactivadas");
      return;
    }
    const permiso = permisoActual();
    setNuncaPreguntado(permiso === "default");
    if (permiso === "granted") {
      try {
        setEstado((await guardarSuscripcion()) ? "activas" : "desactivadas");
      } catch {
        setEstado("desactivadas");
      }
    } else {
      setEstado(permiso === "denied" ? "desactivadas" : "pedir");
    }
  }

  useEffect(() => {
    revisar();
  }, []);

  async function activar() {
    setError(null);
    setActivando(true);
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") {
        setNuncaPreguntado(permiso === "default");
        setEstado("desactivadas");
      } else if (await guardarSuscripcion()) {
        setEstado("activas");
      } else {
        setError(textos.errorActivar);
      }
    } catch {
      setError(textos.errorActivar);
    }
    setActivando(false);
  }

  function ahoraNo() {
    setNuncaPreguntado(true);
    setEstado("desactivadas");
  }

  if (estado === "cargando") return null;

  const botonPrincipal = botonDS.principal;
  const botonSecundario = botonDS.secundario;

  const comoActivar =
    plataforma === "ios"
      ? textos.comoActivarIOS
      : plataforma === "android"
        ? textos.comoActivarAndroid
        : textos.comoActivarEscritorio;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{textos.paso}</span>
          <span className="text-text-muted">{textos.siguiente}</span>
        </div>
        <div aria-hidden className="mt-2 grid grid-cols-3 gap-1">
          <span className="h-1 rounded-full bg-brand-primary" />
          <span className="h-1 rounded-full bg-borde-sutil" />
          <span className="h-1 rounded-full bg-borde-sutil" />
        </div>
      </div>

      <section aria-live="polite" className="rounded-xl border border-borde-sutil bg-surface p-4">
        {estado === "pedir" && (
          <>
            <IconoCampana className="size-6" />
            <h1 className="mt-3 text-tarjeta">{textos.pedirTitulo}</h1>
            <p className="mt-2 text-text-muted">{textos.pedirCuerpo}</p>
            {error && (
              <p role="alert" className="mt-3 text-sm text-danger">
                {error}
              </p>
            )}
            <div className="mt-4 space-y-3">
              <button type="button" onClick={activar} disabled={activando} className={botonPrincipal}>
                {activando ? (
                  <>
                    {textos.activando}
                    <IconoCargando className="size-5" />
                  </>
                ) : (
                  textos.activar
                )}
              </button>
              <button type="button" onClick={ahoraNo} disabled={activando} className={botonSecundario}>
                {textos.ahoraNo}
              </button>
            </div>
          </>
        )}

        {estado === "activas" && (
          <>
            <div className="flex items-center justify-between">
              <IconoCampana className="size-6" />
              <span className="rounded-full bg-fondo-sutil px-3 py-1 text-sm">{textos.activasEtiqueta}</span>
            </div>
            <h1 className="mt-3 text-tarjeta">{textos.activasTitulo}</h1>
            <p className="mt-2 text-text-muted">{textos.activasCuerpo}</p>
          </>
        )}

        {estado === "desactivadas" && (
          <>
            <IconoCampanaTachada className="size-6" />
            <h1 className="mt-3 text-tarjeta">{textos.desactivadasTitulo}</h1>
            <p className="mt-2 text-text-muted">{textos.desactivadasCuerpo}</p>
            {nuncaPreguntado && pushDisponible() ? (
              <button type="button" onClick={activar} disabled={activando} className={`mt-4 ${botonPrincipal}`}>
                {activando ? (
                  <>
                    {textos.activando}
                    <IconoCargando className="size-5" />
                  </>
                ) : (
                  textos.activar
                )}
              </button>
            ) : (
              pushDisponible() && (
                <>
                  <h2 className="mt-4 font-semibold">{textos.comoActivarTitulo}</h2>
                  <p className="mt-1 text-sm text-text-muted">{comoActivar}</p>
                  <p className="mt-3 text-sm">
                    {textos.yaLasPermitiste}{" "}
                    <button type="button" onClick={revisar} className="min-h-11 font-semibold underline">
                      {textos.revisarDeNuevo}
                    </button>
                  </p>
                </>
              )
            )}
          </>
        )}

        {estado === "ios-sin-instalar" && (
          <>
            <IconoCampanaTachada className="size-6" />
            <h1 className="mt-3 text-tarjeta">{textos.iosSinInstalarTitulo}</h1>
            <p className="mt-2 text-text-muted">{textos.iosSinInstalarCuerpo}</p>
            <Link href="/alta/instalar" className={`mt-4 ${botonPrincipal}`}>
              {textos.verGuia}
            </Link>
          </>
        )}
      </section>

      {estado !== "pedir" && estado !== "activas" && <p className="mt-4 text-sm text-text-muted">{textos.nota}</p>}

      {estado !== "pedir" && (
        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={() => router.push(SIGUIENTE)}
            className={estado === "activas" ? botonPrincipal : botonSecundario}
          >
            {estado === "activas" ? textos.continuar : textos.continuarSin}
          </button>
        </div>
      )}
    </div>
  );
}
