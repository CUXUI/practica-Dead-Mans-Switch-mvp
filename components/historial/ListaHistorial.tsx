"use client";

import { useEffect, useState } from "react";
import { Tarjeta } from "@/components/emisor/ui";
import { horaCorta, listaNombres, primerNombre } from "@/app/aviso/_datos/formato";
import { rellenar } from "@/components/aviso/textos";
import type { TextosHistorial } from "./textos";
import type { Destinatario, EntradaAlerta, EntradaConfirmacion, EntradaHistorial } from "./tipos";

// E7 · Historial por fecha: cada confirmación con su hora y cada alerta con a quién se avisó, por qué
// canal, quién la abrió y cómo terminó. Las fechas y horas se calculan en el navegador, con la hora de
// la persona: el servidor no sabe en qué zona está. Hasta entonces la lista queda en estado "cargando".

const claveDia = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

function horaLocal(d: Date) {
  return horaCorta(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
}

function tituloDia(d: Date, t: TextosHistorial) {
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  if (claveDia(d) === claveDia(hoy)) return t.hoy;
  if (claveDia(d) === claveDia(ayer)) return t.ayer;
  const texto = new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long" }).format(d);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function canalesTexto(d: Destinatario, t: TextosHistorial) {
  return d.canales
    .map((c) => `${c.canal === "push" ? t.porPush : t.porCorreo}${c.resultado === "sent" ? "" : ` (${t.noLlego})`}`)
    .join(", ");
}

function Confirmacion({ e, hora, t }: { e: EntradaConfirmacion; hora: string; t: TextosHistorial }) {
  return (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-semibold">{t.confirmacion}</p>
        <p className="shrink-0 text-sm text-text-muted">{hora}</p>
      </div>
      <p className="text-sm text-text-muted">{e.origen === "notification" ? t.origenNotificacion : t.origenApp}</p>
    </>
  );
}

function Alerta({ e, hora, t }: { e: EntradaAlerta; hora: string; t: TextosHistorial }) {
  const nombres = e.destinatarios.map((d) => primerNombre(d.nombre)).filter(Boolean);
  const vieron = e.destinatarios.filter((d) => d.visto).map((d) => primerNombre(d.nombre));
  const final = e.resultado === "closed" ? t.cerrada : e.resultado === "unresolved" ? t.sinResolver : t.enCurso;
  return (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-semibold">{t.alerta}</p>
        <p className="shrink-0 text-sm text-text-muted">{hora}</p>
      </div>
      <p className="text-sm">{nombres.length > 0 ? rellenar(t.avisamosA, { nombres: listaNombres(nombres) }) : t.avisamosNadie}</p>
      {e.destinatarios.length > 0 && (
        <ul className="space-y-0.5 text-sm text-text-muted">
          {e.destinatarios.map((d, i) => (
            <li key={i}>
              {primerNombre(d.nombre)}
              {d.canales.length > 0 ? `: ${canalesTexto(d, t)}` : ""}
            </li>
          ))}
        </ul>
      )}
      <p className="text-sm">
        {vieron.length === 0 ? t.nadieVio : rellenar(vieron.length === 1 ? t.vioUno : t.vioVarios, { nombres: listaNombres(vieron) })}
      </p>
      <p className="text-sm font-medium">{final}</p>
    </>
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

  const grupos: { clave: string; fecha: Date; items: EntradaHistorial[] }[] = [];
  for (const e of entradas) {
    const fecha = new Date(e.cuando);
    const clave = claveDia(fecha);
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.clave === clave) ultimo.items.push(e);
    else grupos.push({ clave, fecha, items: [e] });
  }

  return (
    <div className="space-y-6">
      {grupos.map((g) => (
        <section key={g.clave} aria-labelledby={`dia-${g.clave}`} className="space-y-2">
          <h2 id={`dia-${g.clave}`} className="font-semibold">
            {tituloDia(g.fecha, t)}
          </h2>
          <ul className="space-y-2">
            {g.items.map((e) => (
              <li key={`${e.tipo}-${e.id}`}>
                <Tarjeta>
                  {e.tipo === "confirmacion" ? (
                    <Confirmacion e={e} hora={horaLocal(new Date(e.cuando))} t={t} />
                  ) : (
                    <Alerta e={e} hora={horaLocal(new Date(e.cuando))} t={t} />
                  )}
                </Tarjeta>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {entradas.length >= limite && <p className="text-sm text-text-muted">{rellenar(t.limite, { n: limite })}</p>}
    </div>
  );
}
