"use client";

import { useEffect, useState } from "react";
import { horaCorta, listaNombres, primerNombre } from "@/app/aviso/_datos/formato";
import { rellenar } from "@/components/aviso/textos";
import FilaHistorial, { type ResultadoFila } from "./FilaHistorial";
import type { TextosHistorial } from "./textos";
import type { Destinatario, EntradaAlerta, EntradaConfirmacion, EntradaHistorial, TipoAviso } from "./tipos";

// E7 · Historial: una Fila de historial por movimiento, del más reciente al más antiguo.
// Las fechas y horas se calculan en el navegador, con la hora de la persona: el servidor no sabe en qué
// zona está. Hasta entonces la lista queda en estado "cargando".

const mismoDia = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// "p. m." ya termina en punto: se evita el doble punto cuando la frase también cierra con punto.
const sinPuntoDoble = (texto: string) => texto.replace(/\.\./g, ".");

function hora(d: Date) {
  return horaCorta(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
}

// Fecha corta como en la Biblioteca: "12 oct".
function fechaCorta(d: Date) {
  return new Intl.DateTimeFormat("es", { day: "numeric", month: "short" }).format(d).replace(".", "");
}

// Hoy · Ayer · día de la semana (últimos 6 días) · "12 oct".
function dia(d: Date, t: TextosHistorial) {
  const ahora = new Date();
  const ayer = new Date();
  ayer.setDate(ahora.getDate() - 1);
  if (mismoDia(d, ahora)) return t.hoy;
  if (mismoDia(d, ayer)) return t.ayer;
  if (ahora.getTime() - d.getTime() < 6 * 24 * 60 * 60 * 1000) {
    const s = new Intl.DateTimeFormat("es", { weekday: "long" }).format(d);
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  return fechaCorta(d);
}

function titulo(aviso: TipoAviso, d: Date, t: TextosHistorial) {
  const nombre = aviso === "routine" ? t.avisoRutina : aviso === "trip" ? t.avisoSalida : t.avisoGeneral;
  return `${nombre} · ${dia(d, t)}`;
}

function canal(destinatarios: Destinatario[], t: TextosHistorial) {
  const salieron = destinatarios.flatMap((d) => d.canales).filter((c) => c.resultado === "sent");
  const push = salieron.some((c) => c.canal === "push");
  const correo = salieron.some((c) => c.canal === "email");
  return push && correo ? t.canalAmbos : push ? t.canalPush : correo ? t.canalCorreo : "";
}

function Confirmacion({ e, t }: { e: EntradaConfirmacion; t: TextosHistorial }) {
  const d = new Date(e.cuando);
  return (
    <FilaHistorial resultado="a-tiempo" etiqueta={t.etiquetaATiempo} titulo={titulo(e.aviso, d, t)}>
      <p>{sinPuntoDoble(rellenar(e.origen === "notification" ? t.confirmoNotificacion : t.confirmo, { hora: hora(d) }))}</p>
    </FilaHistorial>
  );
}

function Alerta({ e, t }: { e: EntradaAlerta; t: TextosHistorial }) {
  const d = new Date(e.cuando);
  const nombres = listaNombres(e.destinatarios.map((x) => primerNombre(x.nombre)).filter(Boolean)) || t.tusContactos;
  const vieron = e.destinatarios.filter((x) => x.visto).map((x) => primerNombre(x.nombre));
  const base = { nombres, hora: hora(d), canal: canal(e.destinatarios, t) };

  let resultado: ResultadoFila;
  let etiqueta: string;
  let cuerpo: string;
  if (e.resultado === "closed") {
    resultado = "falsa-alarma";
    etiqueta = t.etiquetaFalsaAlarma;
    cuerpo = e.cerradaEn ? rellenar(t.cerrada, { ...base, cierre: hora(new Date(e.cerradaEn)) }) : rellenar(t.cerradaSinHora, base);
  } else if (e.resultado === "unresolved") {
    resultado = "vencida";
    etiqueta = t.etiquetaVencida;
    const vence = e.venceEn ? new Date(e.venceEn) : null;
    cuerpo = vence ? rellenar(t.vencida, { ...base, fecha: fechaCorta(vence), cierre: hora(vence) }) : rellenar(t.vencidaSinHora, base);
  } else {
    resultado = "en-curso";
    etiqueta = t.etiquetaEnCurso;
    cuerpo = rellenar(t.enCurso, base);
  }

  return (
    <FilaHistorial resultado={resultado} etiqueta={etiqueta} titulo={titulo(e.aviso, d, t)}>
      <p>{sinPuntoDoble(cuerpo)}</p>
      {/* PRD E7: la fila dice también quién abrió la alerta. */}
      <p>{vieron.length === 0 ? t.nadieVio : rellenar(vieron.length === 1 ? t.vioUno : t.vioVarios, { nombres: listaNombres(vieron) })}</p>
    </FilaHistorial>
  );
}

export default function ListaHistorial({ t, entradas, limite }: { t: TextosHistorial; entradas: EntradaHistorial[]; limite: number }) {
  const [listo, setListo] = useState(false);
  useEffect(() => setListo(true), []);

  if (!listo) {
    return (
      <p role="status" className="text-text-muted">
        {t.cargando}
      </p>
    );
  }

  return (
    <div className="space-y-espacio-l">
      <ul className="space-y-espacio-s">
        {entradas.map((e) => (
          <li key={`${e.tipo}-${e.id}`}>{e.tipo === "confirmacion" ? <Confirmacion e={e} t={t} /> : <Alerta e={e} t={t} />}</li>
        ))}
      </ul>
      {entradas.length >= limite && <p className="text-sm leading-[21px] text-text-muted">{rellenar(t.limite, { n: limite })}</p>}
    </div>
  );
}
