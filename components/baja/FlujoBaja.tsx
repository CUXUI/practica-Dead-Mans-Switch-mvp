"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { BotonBaja, MarcoBaja } from "./ui";
import { textosBaja as t } from "./textos";

type Paso = "confirmar" | "cancelado" | "codigo" | "alerta" | "listo" | "inactivo";

export default function FlujoBaja({
  token,
  marca,
  emisor,
  correoOculto,
  estadoInicial,
  alertaInicial,
}: {
  token: string;
  marca: string;
  emisor: string;
  correoOculto: string;
  estadoInicial: "ready" | "confirmed" | "inactive";
  alertaInicial: boolean;
}) {
  const [paso, setPaso] = useState<Paso>(estadoInicial === "ready" ? "confirmar" : estadoInicial === "confirmed" ? "listo" : "inactivo");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [correo, setCorreo] = useState(correoOculto);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const code = params.get("codigo")?.replace(/\D/g, "").slice(0, 6);
    if (estadoInicial === "ready" && code?.length === 6) {
      setDigits(code.split(""));
      setPaso("codigo");
    }
  }, [estadoInicial]);

  async function solicitar() {
    setOcupado(true);
    setError(null);
    try {
      const res = await fetch("/api/baja/solicitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as { kind: string; maskedEmail?: string };
      if (!res.ok || data.kind === "error") throw new Error();
      if (data.kind === "inactive") return setPaso("inactivo");
      setCorreo(data.maskedEmail || correoOculto);
      setDigits(["", "", "", "", "", ""]);
      setPaso("codigo");
      setTimeout(() => inputs.current[0]?.focus(), 0);
    } catch {
      setError(t.error);
    } finally {
      setOcupado(false);
    }
  }

  async function confirmar(force = false) {
    const code = digits.join("");
    if (code.length !== 6) return setError(t.codigo.incorrecto);
    setOcupado(true);
    setError(null);
    try {
      const res = await fetch("/api/baja/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, code, force }),
      });
      const data = (await res.json()) as { kind: string };
      if (data.kind === "ok" || data.kind === "already_confirmed") return setPaso("listo");
      if (data.kind === "alert_open") return setPaso("alerta");
      if (data.kind === "invalid_code") return setError(t.codigo.incorrecto);
      if (data.kind === "expired") return setError(t.codigo.vencido);
      if (data.kind === "inactive") return setPaso("inactivo");
      throw new Error();
    } catch {
      setError(t.error);
    } finally {
      setOcupado(false);
    }
  }

  function cambiar(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError(null);
    if (digit && index < 5) inputs.current[index + 1]?.focus();
  }

  function tecla(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      inputs.current[index + 1]?.focus();
    }
  }

  function pegar(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    setDigits(Array.from({ length: 6 }, (_, i) => pasted[i] ?? ""));
    inputs.current[Math.min(pasted.length, 6) - 1]?.focus();
  }

  if (paso === "inactivo") {
    return <MarcoBaja marca={marca} titulo={t.inactivo.titulo}><p>{t.inactivo.cuerpo}</p></MarcoBaja>;
  }
  if (paso === "listo") {
    return <MarcoBaja marca={marca} titulo={t.listo.titulo(emisor)} mostrarPie><p>{t.listo.cuerpo}</p></MarcoBaja>;
  }
  if (paso === "cancelado") {
    return (
      <MarcoBaja
        marca={marca}
        titulo={t.cancelado.titulo(emisor)}
        acciones={<BotonBaja onClick={() => window.history.back()}>{t.cancelado.accion}</BotonBaja>}
      >
        <p>{t.cancelado.cuerpo}</p>
      </MarcoBaja>
    );
  }
  if (paso === "alerta") {
    return (
      <MarcoBaja
        marca={marca}
        etiqueta={t.alerta.etiqueta}
        titulo={t.alerta.titulo(emisor)}
        acciones={<><BotonBaja disabled={ocupado} onClick={() => confirmar(true)}>{t.alerta.accion}</BotonBaja><BotonBaja variante="secundario" disabled={ocupado} onClick={() => setPaso("codigo")}>{t.alerta.volver}</BotonBaja></>}
      >
        <p>{t.alerta.cuerpo}</p>
        {error && <p role="alert" className="text-danger">{error}</p>}
      </MarcoBaja>
    );
  }
  if (paso === "codigo") {
    return (
      <MarcoBaja
        marca={marca}
        titulo={t.codigo.titulo}
        acciones={<BotonBaja type="submit" form="formulario-codigo-baja" disabled={ocupado}>{ocupado ? t.codigo.comprobando : t.codigo.confirmar}</BotonBaja>}
      >
        <form
          id="formulario-codigo-baja"
          className="flex flex-col gap-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void confirmar();
          }}
        >
          <fieldset disabled={ocupado}>
            <legend className="mb-2 font-semibold">{t.codigo.etiqueta}</legend>
            <div className="flex gap-1.5" onPaste={pegar}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => { inputs.current[index] = element; }}
                  value={digit}
                  onChange={(event) => cambiar(index, event.target.value)}
                  onKeyDown={(event) => tecla(index, event)}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  enterKeyHint="done"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  aria-label={`Dígito ${index + 1} de 6`}
                  aria-describedby={error ? "codigo-ayuda codigo-error" : "codigo-ayuda"}
                  aria-invalid={!!error}
                  maxLength={1}
                  className="size-12 rounded-xl border border-border bg-surface text-center text-2xl font-semibold focus:outline-2 focus:outline-offset-2 focus:outline-brand-primary aria-[invalid=true]:border-danger"
                />
              ))}
            </div>
            <p id="codigo-ayuda" className="mt-2 text-sm text-text-muted">{t.codigo.enviado(correo)}</p>
            {error && <p id="codigo-error" role="alert" className="mt-2 text-sm text-danger">ⓘ {error}</p>}
          </fieldset>
          <button type="button" disabled={ocupado} onClick={solicitar} className="inline-flex min-h-12 items-center self-start font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">
            ↻ {ocupado ? t.codigo.reenviando : t.codigo.reenviar}
          </button>
        </form>
      </MarcoBaja>
    );
  }
  return (
    <MarcoBaja
      marca={marca}
      titulo={t.confirmar.titulo(emisor)}
      acciones={<><BotonBaja disabled={ocupado} onClick={solicitar}>{ocupado ? t.confirmar.enviando : t.confirmar.accion}</BotonBaja><BotonBaja variante="secundario" disabled={ocupado} onClick={() => setPaso("cancelado")}>{t.confirmar.cancelar}</BotonBaja></>}
    >
      <p>{t.confirmar.cuerpo}</p>
      {alertaInicial && <p className="text-sm text-text-muted">Hay una alerta en curso. Te lo mostraremos antes de completar la baja.</p>}
      {error && <p role="alert" className="text-danger">{error}</p>}
    </MarcoBaja>
  );
}
