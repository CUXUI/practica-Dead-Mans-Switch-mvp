"use client";

import { useState } from "react";
import HoldButton from "@/components/home/HoldButton";
import { BotonBaja, MarcoBaja } from "./ui";
import { textosBaja as t } from "./textos";

// Baja del contacto con enlace de correo, sin código: abrir el enlace no hace nada; la baja se confirma
// con una acción deliberada (mantener 2 s; con lector de pantalla, botón + confirmación).
type Paso = "confirmar" | "cancelado" | "listo" | "inactivo";

export default function FlujoBaja({
  token,
  marca,
  emisor,
  estadoInicial,
  alertaInicial,
}: {
  token: string;
  marca: string;
  emisor: string;
  estadoInicial: "ready" | "confirmed" | "inactive";
  alertaInicial: boolean;
}) {
  const [paso, setPaso] = useState<Paso>(estadoInicial === "ready" ? "confirmar" : estadoInicial === "confirmed" ? "listo" : "inactivo");
  const [alerta, setAlerta] = useState(alertaInicial);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmar() {
    setOcupado(true);
    setError(null);
    try {
      // Si la alerta ya se mostró en pantalla, la persona la vio antes de confirmar.
      const res = await fetch("/api/baja/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, force: alerta }),
      });
      const data = (await res.json()) as { kind: string };
      if (data.kind === "ok" || data.kind === "already_confirmed") return setPaso("listo");
      if (data.kind === "alert_open") return setAlerta(true); // la alerta empezó mientras tanto: se muestra y se vuelve a confirmar
      if (data.kind === "expired" || data.kind === "inactive") return setPaso("inactivo");
      throw new Error();
    } catch {
      setError(t.error);
    } finally {
      setOcupado(false);
    }
  }

  if (paso === "inactivo") {
    return (
      <MarcoBaja
        marca={marca}
        titulo={t.inactivo.titulo}
        acciones={<BotonBaja onClick={() => window.location.assign("/baja/solicitar")}>{t.inactivo.pedirNuevo}</BotonBaja>}
      >
        <p>{t.inactivo.cuerpo}</p>
      </MarcoBaja>
    );
  }
  if (paso === "listo") {
    return <MarcoBaja marca={marca} titulo={t.listo.titulo(emisor)} mostrarPie><p>{t.listo.cuerpo}</p></MarcoBaja>;
  }
  if (paso === "cancelado") {
    return (
      <MarcoBaja
        marca={marca}
        titulo={t.cancelado.titulo(emisor)}
        acciones={<BotonBaja onClick={() => setPaso("confirmar")}>{t.cancelado.accion}</BotonBaja>}
      >
        <p>{t.cancelado.cuerpo}</p>
      </MarcoBaja>
    );
  }
  return (
    <MarcoBaja
      marca={marca}
      titulo={t.confirmar.titulo(emisor)}
      acciones={
        <>
          <HoldButton
            label={t.confirmar.accion}
            help={t.confirmar.ayudaMantener}
            helpSmall={t.confirmar.ayudaSuelta}
            holdingLabel={t.confirmar.sigue}
            helpAssisted={t.confirmar.ayudaAsistida}
            confirmQuestion={t.confirmar.confirmarPregunta(emisor)}
            confirmYes={t.confirmar.confirmarSi}
            confirmBack={t.confirmar.volver}
            busyLabel={t.confirmar.enviando}
            busy={ocupado}
            onComplete={confirmar}
          />
          <BotonBaja variante="secundario" disabled={ocupado} onClick={() => setPaso("cancelado")}>
            {t.confirmar.cancelar}
          </BotonBaja>
        </>
      }
    >
      <p>{t.confirmar.cuerpo}</p>
      {alerta && <p className="rounded-xl bg-fondo-sutil p-4 font-medium">{t.confirmar.alerta(emisor)}</p>}
      {error && <p role="alert" className="text-danger">{error}</p>}
    </MarcoBaja>
  );
}
