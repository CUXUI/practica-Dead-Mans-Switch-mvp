"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { encenderAviso, apagarAviso } from "@/app/aviso/encender";
import { confirmarAviso, type ResultadoConfirmar } from "@/app/home/confirmar";
import { CONFIG_EMISOR } from "@/app/aviso/_datos/config";
import { horaCorta, proximoPlazo } from "@/app/aviso/_datos/formato";
import { rellenar } from "@/components/aviso/textos";
import { clases } from "@/components/emisor/ui";
import Spinner from "@/components/emisor/Spinner";
import type { Frecuencia } from "@/app/aviso/_datos/tipos";
import type { TextosInicio } from "./textosInicio";

// Interruptor para encender y apagar el aviso (E-02 Apagado y Activo, E-12 y E-14 del wireflow).
// Encender: sin diálogo (nota del flujo). Apagar: pide confirmar. "Editar" no vive aquí: es un botón
// aparte que está desactivado con el aviso encendido y se activa al apagarlo (decisión de Mariola 14/11).
// Los errores no se esconden: "Reintentar".

// "Estoy bien" (E1 y E-08). Vive en el Inicio activo, desde 30 min antes de la hora hasta el final del
// tiempo de gracia, y llama a la server action confirmarAviso (app/home/confirmar.ts): guarda la
// confirmación, pasa el aviso a su próximo plazo y reprograma QStash ("Solo hoy" termina y apaga el aviso).
// Solo con ok va a /home?confirmado=1, donde Inicio enseña la hora guardada y el próximo plazo.
// Si no llega (sin conexión o falla del servidor), dice que NO se registró y reintenta solo (E1).

// Esperas entre reintentos automáticos; la última se repite hasta que se cierra la ventana para confirmar.
const PAUSAS_MS = [5_000, 15_000, 30_000, 60_000];

const hhmmDe = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

function horaDe(d: Date) {
  return horaCorta(hhmmDe(d));
}

type Fase = "reposo" | "enviando" | "error" | "confirmando";

export default function ControlAviso({
  t,
  encendido,
  fireAt,
  frecuencia,
  dias,
  estado,
  detalle,
  notaEditar,
  graciaMin = 0,
  titulo,
  children,
}: {
  // Con título, el interruptor va a la derecha del título y lo que se pasa como hijo (el plazo) queda debajo.
  titulo?: string;
  children?: ReactNode;
  // Minutos de tiempo de gracia del aviso (pasada la hora, antes de avisar a los contactos).
  graciaMin?: number;
  // Aviso bajo el interruptor ("Para editarlo, apaga primero"). No sale mientras no se puede apagar.
  notaEditar?: string;
  // Con estado, el interruptor va a la derecha de un bloque con el estado y su explicación (Inicio apagado).
  estado?: string;
  detalle?: string;
  t: TextosInicio;
  encendido: boolean;
  fireAt: string;
  frecuencia: Frecuencia;
  dias: number[];
}) {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("reposo");
  const [error, setError] = useState<string | null>(null);
  const [, empezar] = useTransition();
  const [bloqueado, setBloqueado] = useState(false);
  const [enGracia, setEnGracia] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [errorConfirmar, setErrorConfirmar] = useState<string | null>(null);
  // Reintento automático pendiente: "red" espera a que vuelva la conexión; "pronto", a que pase la pausa.
  const [espera, setEspera] = useState<"red" | "pronto" | null>(null);
  const intentos = useRef(0);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enviando = useRef(false);
  const confirmarRef = useRef<() => void>(() => {});
  const aviso = useRef<HTMLDivElement>(null);
  const pregunta = useRef<HTMLParagraphElement>(null);

  // Mientras se espera la confirmación no se puede apagar (ventana antes de la hora y tiempo de gracia).
  useEffect(() => {
    const calcula = () => {
      const f = new Date(fireAt).getTime();
      setBloqueado(encendido && Date.now() >= f - CONFIG_EMISOR.ventanaConfirmarMin * 60_000);
      setEnGracia(encendido && Date.now() >= f);
    };
    calcula();
    const id = setInterval(calcula, 30_000);
    return () => clearInterval(id);
  }, [encendido, fireAt]);

  useEffect(() => {
    if (fase === "confirmando") pregunta.current?.focus();
    if (fase === "error") aviso.current?.focus();
  }, [fase]);

  function encender() {
    setFase("enviando");
    setError(null);
    // El plazo se calcula aquí, con la zona horaria de la persona. Si el guardado sigue vigente se respeta.
    let plazo = new Date(fireAt);
    if (plazo.getTime() - Date.now() < 60_000) {
      const d = new Date(fireAt);
      const hhmm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      const siguiente = proximoPlazo(hhmm, frecuencia, dias);
      if (!siguiente) {
        setError(t.encender.horaPasada);
        setFase("error");
        return;
      }
      plazo = siguiente;
    }
    empezar(async () => {
      const r = await encenderAviso(plazo.toISOString()).catch(() => ({ ok: false as const, error: t.encender.error }));
      if (r.ok) {
        router.replace("/home?encendido=1");
        router.refresh();
      } else {
        setError(r.error);
        setFase("error");
      }
    });
  }

  function apagar() {
    setFase("enviando");
    setError(null);
    empezar(async () => {
      const r = await apagarAviso().catch(() => ({ ok: false as const, error: t.apagar.error }));
      if (r.ok) {
        router.replace("/home?apagado=1");
        router.refresh();
      } else {
        setError(r.error);
        setFase("error");
      }
    });
  }

  // Próximo plazo en la hora local del navegador (el servidor no conoce la zona horaria y lo valida).
  // Se cuenta desde el plazo actual, así que con "Todos los días" es el mismo día, mañana.
  function calcularProximo(): string | null {
    if (frecuencia === "once") return null;
    const actual = new Date(fireAt);
    return proximoPlazo(hhmmDe(actual), frecuencia, dias, actual)?.toISOString() ?? null;
  }

  // "Estoy bien" (firma acordada): solo se da por hecho cuando el servidor lo guardó.
  async function confirmarEstoyBien(): Promise<ResultadoConfirmar> {
    try {
      return await confirmarAviso({ plazo: fireAt, proximo: calcularProximo() });
    } catch {
      // Sin conexión o la petición no llegó: no se sabe si se guardó. Reintentar es seguro, el servidor
      // reconoce una confirmación ya guardada y no la repite.
      return { ok: false, error: t.confirmar.error, reintentable: true };
    }
  }

  function pararReintento() {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = null;
  }

  async function confirmar() {
    if (enviando.current) return;
    enviando.current = true;
    pararReintento();
    setEspera(null);
    setErrorConfirmar(null);
    setConfirmando(true);
    const r = await confirmarEstoyBien();
    enviando.current = false;
    if (r.ok) {
      intentos.current = 0;
      router.replace("/home?confirmado=1");
      router.refresh();
      return;
    }
    setConfirmando(false);
    setErrorConfirmar(r.error);
    if (!r.reintentable) {
      // Alerta en curso o aviso cambiado: Inicio se recarga y muestra el estado real.
      if (r.error === t.confirmar.enAlerta || r.error === t.confirmar.cambio) router.refresh();
      return;
    }
    programarReintento();
  }
  confirmarRef.current = confirmar;

  function programarReintento() {
    // Pasado el tiempo de gracia ya no se puede confirmar aquí: Inicio se recarga (el aviso pasa a alerta).
    if (Date.now() > finGracia) {
      router.refresh();
      return;
    }
    if (!navigator.onLine) {
      setEspera("red");
      return;
    }
    const pausa = PAUSAS_MS[Math.min(intentos.current, PAUSAS_MS.length - 1)];
    intentos.current += 1;
    setEspera("pronto");
    temporizador.current = setTimeout(() => confirmarRef.current(), pausa);
  }

  // Fin del tiempo de gracia: a partir de ahí el motor avisa a los contactos y ya no se confirma aquí.
  const finGracia = new Date(fireAt).getTime() + graciaMin * 60_000;
  const esperaRef = useRef(espera);
  esperaRef.current = espera;

  // Si se espera la conexión, se reintenta al volver la red y, además, cada 60 s: en Android el evento
  // "online" se pierde si la página está en segundo plano (probado en el celular).
  useEffect(() => {
    if (espera !== "red") return;
    const reintentar = () => confirmarRef.current();
    window.addEventListener("online", reintentar);
    const id = setInterval(reintentar, 60_000);
    return () => {
      window.removeEventListener("online", reintentar);
      clearInterval(id);
    };
  }, [espera]);

  // Al volver a la página (visible o con foco): si ya terminó el tiempo de gracia, Inicio se recarga para
  // mostrar el estado real; si no, y hay un reintento pendiente, se reintenta en el acto. En segundo plano
  // Android frena los temporizadores y puede perder el evento "online".
  useEffect(() => {
    if (!encendido) return;
    const alVolver = () => {
      if (document.visibilityState === "hidden") return;
      if (Date.now() > finGracia) {
        router.refresh();
        return;
      }
      if (esperaRef.current) confirmarRef.current();
    };
    const alCambiarVisibilidad = () => {
      if (document.visibilityState === "visible") alVolver();
    };
    window.addEventListener("focus", alVolver);
    document.addEventListener("visibilitychange", alCambiarVisibilidad);
    return () => {
      window.removeEventListener("focus", alVolver);
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
    };
  }, [encendido, finGracia, router]);

  // Justo al terminar el tiempo de gracia, Inicio se recarga solo. Otra vez a los 30 s, por si el motor
  // todavía no había pasado el aviso a alerta en la primera recarga.
  useEffect(() => {
    if (!encendido) return;
    const falta = finGracia - Date.now();
    if (falta < 0) return; // Ya pasó: lo cubre la recarga al volver a la página.
    const ids = [setTimeout(() => router.refresh(), falta), setTimeout(() => router.refresh(), falta + 30_000)];
    return () => ids.forEach(clearTimeout);
  }, [encendido, finGracia, router]);

  useEffect(() => pararReintento, []);

  function alternar() {
    if (!encendido) encender();
    else setFase("confirmando");
  }

  const ocupado = fase === "enviando";
  const etiqueta = encendido ? t.tocaApagar : t.tocaEncender;
  const dialogo = fase === "confirmando";

  const interruptor = (
    <button
      type="button"
      role="switch"
      aria-checked={encendido}
      aria-describedby={bloqueado ? "no-se-puede-apagar" : undefined}
      disabled={ocupado || bloqueado}
      onClick={alternar}
      className="relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border-2 border-text bg-surface transition-colors disabled:opacity-60 aria-checked:bg-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
    >
      <span aria-hidden="true" className={`size-5 rounded-full transition-transform ${encendido ? "translate-x-7 bg-surface" : "translate-x-1 bg-text"}`} />
      <span className="sr-only">{etiqueta}</span>
    </button>
  );

  return (
    <div className={titulo ? "space-y-5" : "space-y-3"}>
      {titulo && (
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          {!dialogo && interruptor}
        </div>
      )}
      {children}
      {(ocupado || fase === "error") && (
        <div
          ref={aviso}
          tabIndex={-1}
          role={fase === "error" ? "alert" : "status"}
          className={`space-y-1 rounded-lg bg-surface-muted p-3 ${fase === "error" ? "border-2 border-danger" : ""}`}
        >
          {ocupado ? (
            <>
              <p className="inline-flex items-center gap-2 font-semibold"><Spinner />{encendido ? t.apagando : t.encendiendo}</p>
              <p className="text-sm text-text-muted">{t.unMomento}</p>
            </>
          ) : (
            <>
              <p className="font-semibold">{encendido ? t.noPudimosApagar : t.noPudimosEncender}</p>
              <p className="text-sm text-text-muted">{error ?? t.revisaConexion}</p>
              {/hora/.test(error ?? "") && !encendido && (
                // La hora ya pasó: el camino es editar el aviso, así que va un botón directo.
                <Link href="/aviso" className={clases.enlace}>
                  {t.cambiarHora}
                </Link>
              )}
              {!/hora|alerta|confirm|aceptó/.test(error ?? "") && (
                <button type="button" className={clases.enlace} onClick={() => (encendido ? apagar() : encender())}>
                  {t.reintentar}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {dialogo && (
        <div className="space-y-2 rounded-lg border-2 border-border bg-surface-muted p-3" role="group" aria-labelledby="pregunta-apagar">
          <p id="pregunta-apagar" ref={pregunta} tabIndex={-1} className="font-semibold">
            {t.apagarPregunta}
          </p>
          <p className="text-sm text-text-muted">{t.apagarTexto}</p>
          <div className="flex flex-col gap-2">
            <button type="button" className={clases.principal} onClick={apagar}>
              {t.apagarBoton}
            </button>
            <button type="button" className={clases.secundario} onClick={() => setFase("reposo")}>
              {t.dejarActivo}
            </button>
          </div>
        </div>
      )}

      {!dialogo && (
        <>
          {!titulo && (() => {
            return estado ? (
              <div className="flex items-center justify-between gap-4 rounded-lg bg-surface-muted p-3">
                <div className="min-w-0">
                  <p className="font-semibold">{estado}</p>
                  {detalle && <p className="text-sm text-text-muted">{detalle}</p>}
                </div>
                {interruptor}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {interruptor}
                {!bloqueado && <span className="text-sm">{etiqueta}</span>}
              </div>
            );
          })()}
          {bloqueado ? (
            <div id="no-se-puede-apagar" className="space-y-1 rounded-lg bg-surface-muted p-3">
              <p className="font-semibold">{enGracia ? t.graciaTitulo : t.noSePuedeTitulo}</p>
              <p className="text-sm text-text-muted">{enGracia
                  ? rellenar(t.graciaTexto, { hasta: horaDe(new Date(new Date(fireAt).getTime() + graciaMin * 60_000)) })
                  : rellenar(t.noSePuedeTexto, { hasta: horaDe(new Date(fireAt)) })}</p>
              {/* Nunca "confirmado" sin servidor: si no llegó, se dice y se reintenta solo. */}
              <p role="alert" className="text-sm font-medium text-danger empty:hidden">
                {espera === "red" ? t.confirmar.sinRed : espera === "pronto" ? t.confirmar.reintentando : (errorConfirmar ?? "")}
              </p>
              <button
                type="button"
                onClick={() => {
                  intentos.current = 0;
                  confirmar();
                }}
                disabled={confirmando}
                aria-busy={confirmando}
                className={clases.principal}
              >
                {confirmando ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner />
                    {t.confirmando}
                  </span>
                ) : espera ? (
                  t.confirmar.reintentarAhora
                ) : (
                  t.estoyBien
                )}
              </button>
            </div>
          ) : (
            notaEditar && <p className="text-sm text-text-muted">{notaEditar}</p>
          )}
        </>
      )}
    </div>
  );
}
