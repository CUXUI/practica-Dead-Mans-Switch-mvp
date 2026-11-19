"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { alCambiarAviso, estaInstalada, hayAvisoInstalacion, instalarConAviso } from "@/components/landing/instalacion";
import { estiloBotonPrincipal } from "@/components/landing/ui";

// Botón "Instalar". Si el navegador ofrece instalar (Android/Chrome), abre ese aviso.
// Si no, lleva a las instrucciones de la sección "Instala la app". Con JavaScript apagado sigue siendo un enlace.
export default function BotonInstalar({
  texto,
  destino,
  className = "",
}: {
  texto: string;
  destino: string;
  className?: string;
}) {
  const [puedeInstalar, setPuedeInstalar] = useState(false);
  const [instalada, setInstalada] = useState(false);

  useEffect(() => {
    setInstalada(estaInstalada());
    setPuedeInstalar(hayAvisoInstalacion());
    return alCambiarAviso(() => {
      setPuedeInstalar(hayAvisoInstalacion());
      setInstalada(estaInstalada());
    });
  }, []);

  async function alPulsar(e: MouseEvent<HTMLAnchorElement>) {
    if (!puedeInstalar) return; // sin aviso del navegador: el enlace lleva a las instrucciones
    e.preventDefault();
    await instalarConAviso();
  }

  if (instalada) return null;

  return (
    <a href={destino} onClick={alPulsar} className={`${estiloBotonPrincipal} ${className}`}>
      {texto}
    </a>
  );
}
