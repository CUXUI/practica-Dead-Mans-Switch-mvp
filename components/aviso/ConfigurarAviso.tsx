"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { guardarAviso } from "@/app/aviso/actions";
import { DIAS, duracion, duracionLarga, horaCorta, horaLarga, listaNombres, primerNombre, proximoPlazo } from "@/app/aviso/_datos/formato";
import type { Frecuencia } from "@/app/aviso/_datos/tipos";
import { Badge, BarraTitulo, Numero, Pantalla, Progreso, Tarjeta, clases } from "@/components/emisor/ui";
import { rellenar, type TextosAviso } from "./textos";

// E · Configurar aviso · Hora / Pasos / Contactos → Resumen → Guardando → Inicio.
// Todo el asistente vive en una sola pantalla de cliente y se guarda al final (apagado).

export type ContactoOpcion = { id: string; name: string; accepted: boolean; relacion: string | null };

export type Inicial = {
  fireAt: string | null;
  horaPorDefecto: string;
  frecuencia: Frecuencia;
  dias: number[];
  graciaMin: number;
  mensaje: string;
  pasos: string[];
  contactos: string[];
};

type Limites = {
  graciaOpciones: number[];
  graciaMin: number;
  graciaMax: number;
  mensajeMax: number;
  pasoMax: number;
  pasosMax: number;
};

type Paso = "hora" | "pasos" | "contactos" | "resumen";

const ORDEN: Paso[] = ["hora", "pasos", "contactos", "resumen"];

export default function ConfigurarAviso({
  t,
  inicial,
  opciones,
  pasosObligatorios,
  limites,
  volverHref,
}: {
  t: TextosAviso;
  inicial: Inicial;
  opciones: ContactoOpcion[];
  pasosObligatorios: boolean;
  limites: Limites;
  volverHref: string;
}) {
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>("hora");

  const [hora, setHora] = useState(inicial.horaPorDefecto);
  const [frecuencia, setFrecuencia] = useState<Frecuencia>(inicial.frecuencia);
  const [dias, setDias] = useState<number[]>(inicial.dias);
  const esOtro = !limites.graciaOpciones.includes(inicial.graciaMin);
  const [graciaOtro, setGraciaOtro] = useState(esOtro);
  const [gracia, setGracia] = useState(inicial.graciaMin);
  const [mensaje, setMensaje] = useState(inicial.mensaje);
  const [pasos, setPasos] = useState<string[]>(inicial.pasos);
  const [enAviso, setEnAviso] = useState<string[]>(inicial.contactos);

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  const titulo = useRef<HTMLHeadingElement>(null);
  const primerRender = useRef(true);

  // La hora guardada viene en UTC: se pasa a la hora local en el navegador.
  useEffect(() => {
    if (!inicial.fireAt) return;
    const d = new Date(inicial.fireAt);
    if (!Number.isNaN(d.getTime())) setHora(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
  }, [inicial.fireAt]);

  // Al cambiar de paso: arriba del todo y foco en el título (lector de pantalla).
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    titulo.current?.focus();
  }, [paso]);

  const porId = new Map(opciones.map((c) => [c.id, c]));
  const elegidos = enAviso.map((id) => porId.get(id)).filter((c): c is ContactoOpcion => !!c);
  const otros = opciones.filter((c) => !enAviso.includes(c.id));

  function ir(p: Paso) {
    setErrores({});
    setPaso(p);
  }

  function atras() {
    const i = ORDEN.indexOf(paso);
    if (i === 0) router.push(volverHref);
    else ir(ORDEN[i - 1]);
  }

  // ---------- Validaciones ----------
  function validarHora() {
    const e: Record<string, string> = {};
    if (frecuencia === "weekly" && dias.length === 0) e.dias = t.hora.errorDias;
    else if (!proximoPlazo(hora, frecuencia, dias)) e.hora = t.hora.errorPasada;
    if (gracia < limites.graciaMin || gracia > limites.graciaMax) e.gracia = t.hora.errorGracia;
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  function validarPasos() {
    const e: Record<string, string> = {};
    pasos.forEach((p, i) => {
      if (!p.trim()) e[`paso-${i}`] = t.pasos.errorVacio;
    });
    if (pasosObligatorios && pasos.length === 0) e.pasos = t.pasos.errorNinguno;
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  function validarContactos() {
    const e: Record<string, string> = {};
    if (enAviso.length === 0) e.contactos = t.contactos.errorNinguno;
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  async function guardar() {
    setErrorGuardar(null);
    const plazo = proximoPlazo(hora, frecuencia, dias);
    if (!plazo) {
      ir("hora");
      setErrores({ hora: t.hora.errorPasada });
      return;
    }
    setGuardando(true);
    try {
      const r = await guardarAviso({
        frecuencia,
        dias,
        graciaMin: gracia,
        mensaje,
        pasos: pasos.map((p) => p.trim()).filter(Boolean),
        contactos: enAviso,
        fireAt: plazo.toISOString(),
      });
      if (!r.ok) {
        setGuardando(false);
        setErrorGuardar(r.error);
        return;
      }
      router.push("/home");
      router.refresh();
    } catch {
      setGuardando(false);
      setErrorGuardar(t.resumen.errorGuardar);
    }
  }

  // ---------- Textos derivados ----------
  const textoFrecuencia =
    frecuencia === "once"
      ? t.hora.soloHoy
      : frecuencia === "daily"
        ? t.hora.aDiario
        : capitalizar(listaNombres(DIAS.filter((d) => dias.includes(d.valor)).map((d) => d.nombre)));

  const nombresElegidos = elegidos.map((c) => primerNombre(c.name));
  const textoOrden =
    nombresElegidos.length === 0
      ? ""
      : nombresElegidos.length === 1
        ? rellenar(t.contactos.ordenUno, { primero: nombresElegidos[0] })
        : rellenar(t.contactos.ordenVarios, { primero: nombresElegidos[0], resto: listaNombres(nombresElegidos.slice(1)) });

  const numero = ORDEN.indexOf(paso) + 1;
  const cabecera = (
    <>
      <BarraTitulo titulo={paso === "resumen" ? t.resumen.titulo : t.titulo} onVolver={guardando ? undefined : atras} />
      {paso !== "resumen" && <Progreso actual={numero} total={3} />}
      <h2 ref={titulo} tabIndex={-1} className="sr-only">
        {paso === "resumen" ? t.resumen.titulo : `${t.titulo}, paso ${numero} de 3`}
      </h2>
    </>
  );

  // ---------- Paso 1 · Hora ----------
  if (paso === "hora") {
    return (
      <Pantalla
        pie={
          <button type="button" className={clases.principal} onClick={() => validarHora() && ir("pasos")}>
            {t.continuar}
          </button>
        }
      >
        {cabecera}
        <Tarjeta>
          <label htmlFor="hora" className={clases.etiqueta}>
            {t.hora.titulo}
          </label>
          <input
            id="hora"
            type="time"
            required
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            aria-invalid={!!errores.hora}
            aria-describedby={errores.hora ? "hora-error" : "hora-ayuda"}
            className={clases.campo}
          />
          {errores.hora ? (
            <p id="hora-error" className={clases.error}>
              {errores.hora}
            </p>
          ) : (
            <p id="hora-ayuda" className={clases.ayuda}>
              {t.hora.ayuda}
            </p>
          )}
        </Tarjeta>

        <Tarjeta>
          <fieldset className="space-y-3">
            <legend className="mb-3 font-semibold">{t.hora.frecuencia}</legend>
            <Segmentado
              name="frecuencia"
              valor={frecuencia}
              onChange={(v) => setFrecuencia(v as Frecuencia)}
              opciones={[
                { valor: "once", label: t.hora.soloHoy },
                { valor: "daily", label: t.hora.aDiario },
                { valor: "weekly", label: t.hora.elegirDias },
              ]}
            />
            {frecuencia === "weekly" && (
              <div>
                <div className="grid grid-cols-7 gap-1" role="group" aria-label={t.hora.elegirDias}>
                  {DIAS.map((d) => (
                    <label key={d.valor} className={claseSegmento}>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={dias.includes(d.valor)}
                        aria-label={d.nombre}
                        onChange={(e) =>
                          setDias((prev) => (e.target.checked ? [...prev, d.valor] : prev.filter((x) => x !== d.valor)))
                        }
                      />
                      <span aria-hidden="true">{d.corto}</span>
                    </label>
                  ))}
                </div>
                {errores.dias && <p className={clases.error}>{errores.dias}</p>}
              </div>
            )}
          </fieldset>
        </Tarjeta>

        <Tarjeta>
          <fieldset className="space-y-3">
            <legend className="mb-3 font-semibold">{t.hora.gracia}</legend>
            <Segmentado
              name="gracia"
              valor={graciaOtro ? "otro" : String(gracia)}
              onChange={(v) => {
                if (v === "otro") {
                  setGraciaOtro(true);
                } else {
                  setGraciaOtro(false);
                  setGracia(Number(v));
                }
              }}
              opciones={[
                ...limites.graciaOpciones.map((m) => ({ valor: String(m), label: duracion(m), aria: duracionLarga(m) })),
                { valor: "otro", label: t.hora.otro },
              ]}
            />
            {graciaOtro && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="gracia-h" className="mb-1 block text-sm font-medium">
                    {t.hora.otroHoras}
                  </label>
                  <select
                    id="gracia-h"
                    className={clases.campo}
                    value={Math.floor(gracia / 60)}
                    onChange={(e) => setGracia(Math.min(Number(e.target.value) * 60 + (gracia % 60), limites.graciaMax))}
                  >
                    {Array.from({ length: limites.graciaMax / 60 + 1 }, (_, h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="gracia-m" className="mb-1 block text-sm font-medium">
                    {t.hora.otroMinutos}
                  </label>
                  <select
                    id="gracia-m"
                    className={clases.campo}
                    value={gracia % 60}
                    onChange={(e) => setGracia(Math.floor(gracia / 60) * 60 + Number(e.target.value))}
                  >
                    {[0, 15, 30, 45].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {errores.gracia ? (
              <p className={clases.error}>{errores.gracia}</p>
            ) : (
              <p className={clases.ayuda}>{t.hora.graciaAyuda}</p>
            )}
          </fieldset>
        </Tarjeta>

        <Tarjeta>
          <label htmlFor="mensaje" className={clases.etiqueta}>
            {t.hora.mensaje}
          </label>
          <textarea
            id="mensaje"
            rows={3}
            maxLength={limites.mensajeMax}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            aria-describedby="mensaje-contador"
            className={`${clases.campo} resize-none`}
          />
          <p id="mensaje-contador" className="text-right text-sm text-text-muted">
            {mensaje.length} / {limites.mensajeMax}
          </p>
        </Tarjeta>
      </Pantalla>
    );
  }

  // ---------- Paso 2 · Pasos a seguir ----------
  if (paso === "pasos") {
    return (
      <Pantalla
        pie={
          <button type="button" className={clases.principal} onClick={() => validarPasos() && ir("contactos")}>
            {t.continuar}
          </button>
        }
      >
        {cabecera}
        <Tarjeta titulo={t.pasos.titulo} id="titulo-pasos">
          <p className="text-text-muted">{t.pasos.texto}</p>
          <ol className="space-y-3">
            {pasos.map((p, i) => {
              const err = errores[`paso-${i}`];
              const etiqueta = rellenar(t.pasos.etiqueta, { n: i + 1 });
              return (
                <li key={i}>
                  <div className="flex items-center gap-2">
                    <Numero n={i + 1} />
                    <label htmlFor={`paso-${i}`} className="sr-only">
                      {etiqueta}
                    </label>
                    <input
                      id={`paso-${i}`}
                      value={p}
                      maxLength={limites.pasoMax}
                      placeholder={err ? t.pasos.errorVacio : undefined}
                      onChange={(e) => setPasos((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
                      aria-invalid={!!err}
                      aria-describedby={err ? `paso-${i}-error` : undefined}
                      className={clases.campo}
                    />
                    <button
                      type="button"
                      onClick={() => setPasos((prev) => prev.filter((_, j) => j !== i))}
                      aria-label={rellenar(t.pasos.quitar, { n: i + 1 })}
                      className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-border"
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  {err && (
                    <p id={`paso-${i}-error`} className={`${clases.error} pl-11`}>
                      {err}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
          {errores.pasos && (
            <p role="alert" className={clases.error}>
              {errores.pasos}
            </p>
          )}
          {pasos.length < limites.pasosMax && (
            <button type="button" className={clases.secundario} onClick={() => setPasos((prev) => [...prev, ""])}>
              + {t.pasos.anadir}
            </button>
          )}
        </Tarjeta>
      </Pantalla>
    );
  }

  // ---------- Paso 3 · Contactos del aviso ----------
  if (paso === "contactos") {
    const mover = (i: number, delta: number) =>
      setEnAviso((prev) => {
        const n = [...prev];
        [n[i], n[i + delta]] = [n[i + delta], n[i]];
        return n;
      });
    return (
      <Pantalla
        pie={
          <button type="button" className={clases.principal} onClick={() => validarContactos() && ir("resumen")}>
            {t.revisar}
          </button>
        }
      >
        {cabecera}
        <Tarjeta titulo={t.contactos.titulo} id="titulo-contactos">
          {textoOrden && <p className="text-text-muted">{textoOrden}</p>}
          {opciones.length === 0 && (
            <>
              <p>{t.contactos.sinContactos}</p>
              <Link href="/contactos/nuevo" className={clases.enlace}>
                {t.contactos.agregarContacto}
              </Link>
            </>
          )}
          <ol className="space-y-3">
            {elegidos.map((c, i) => (
              <li key={c.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                <Numero n={i + 1} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{c.name}</p>
                  {c.relacion && <p className="text-sm text-text-muted">{c.relacion}</p>}
                  <button
                    type="button"
                    className={clases.enlace}
                    onClick={() => setEnAviso((prev) => prev.filter((id) => id !== c.id))}
                    aria-label={`${t.contactos.quitar}: ${c.name}`}
                  >
                    {t.contactos.quitar}
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <BotonFlecha arriba disabled={i === 0} label={rellenar(t.contactos.subir, { nombres: c.name })} onClick={() => mover(i, -1)} />
                  <BotonFlecha
                    disabled={i === elegidos.length - 1}
                    label={rellenar(t.contactos.bajar, { nombres: c.name })}
                    onClick={() => mover(i, 1)}
                  />
                </div>
              </li>
            ))}
          </ol>
          {errores.contactos && (
            <p role="alert" className={clases.error}>
              {errores.contactos}
            </p>
          )}
          {otros.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">{t.contactos.otros}</h3>
              <ul className="space-y-3">
                {otros.map((c) => (
                  <li key={c.id} className="rounded-lg border border-border/50 p-3">
                    <p className="font-semibold">{c.name}</p>
                    {c.relacion && <p className="text-sm text-text-muted">{c.relacion}</p>}
                    <button
                      type="button"
                      className={clases.enlace}
                      onClick={() => setEnAviso((prev) => [...prev, c.id])}
                      aria-label={`${t.contactos.anadir}: ${c.name}`}
                    >
                      {t.contactos.anadir}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Tarjeta>
      </Pantalla>
    );
  }

  // ---------- Resumen ----------
  const hayAceptado = elegidos.some((c) => c.accepted);
  const pendientes = elegidos.filter((c) => !c.accepted).map((c) => primerNombre(c.name));
  const pasosLimpios = pasos.map((p) => p.trim()).filter(Boolean);

  return (
    <Pantalla
      pie={
        <>
          {errorGuardar && (
            <p role="alert" className={clases.error}>
              {errorGuardar}
            </p>
          )}
          <button type="button" className={clases.principal} onClick={guardar} disabled={guardando} aria-busy={guardando}>
            {guardando ? t.resumen.guardando : t.resumen.guardar}
          </button>
        </>
      }
    >
      {cabecera}
      <Tarjeta>
        {!hayAceptado && <Badge>{t.resumen.esperando}</Badge>}
        <p className="text-lg font-semibold">{t.resumen.apagado}</p>
        {!hayAceptado && (
          <p className="text-text-muted">
            {t.resumen.podras}{" "}
            {pendientes.length > 0 &&
              rellenar(pendientes.length === 1 ? t.resumen.aunNoUno : t.resumen.aunNoVarios, { nombres: listaNombres(pendientes) })}
          </p>
        )}
      </Tarjeta>
      <Tarjeta titulo={t.resumen.tuAviso} id="tu-aviso">
        <dl className="divide-y divide-border/30">
          <Dato termino={t.resumen.frecuencia}>{textoFrecuencia}</Dato>
          <Dato termino={t.resumen.hora}>
            <span aria-hidden="true">{horaCorta(hora)}</span>
            <span className="sr-only">{horaLarga(hora)}</span>
          </Dato>
          <Dato termino={t.resumen.gracia}>
            <span aria-hidden="true">{duracion(gracia)}</span>
            <span className="sr-only">{duracionLarga(gracia)}</span>
          </Dato>
          <Dato termino={t.resumen.contactos}>
            <ol className="text-right">
              {elegidos.map((c) => (
                <li key={c.id}>{c.name}</li>
              ))}
            </ol>
          </Dato>
          <Dato termino={t.resumen.pasos}>
            <ol className="text-right">
              {pasosLimpios.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </Dato>
          {mensaje.trim() && <Dato termino={t.resumen.mensaje}>{mensaje.trim()}</Dato>}
        </dl>
      </Tarjeta>
    </Pantalla>
  );
}

// ---------- Piezas ----------

const claseSegmento =
  "flex min-h-12 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface px-2 text-center font-medium has-[:checked]:bg-brand-primary has-[:checked]:text-brand-on-primary has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-primary";

function Segmentado({
  name,
  valor,
  onChange,
  opciones,
}: {
  name: string;
  valor: string;
  onChange: (v: string) => void;
  opciones: { valor: string; label: string; aria?: string }[];
}) {
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${opciones.length}, minmax(0, 1fr))` }}>
      {opciones.map((o) => (
        <label key={o.valor} className={claseSegmento}>
          <input
            type="radio"
            name={name}
            value={o.valor}
            checked={valor === o.valor}
            onChange={() => onChange(o.valor)}
            className="sr-only"
            aria-label={o.aria}
          />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}

function BotonFlecha({ arriba, disabled, label, onClick }: { arriba?: boolean; disabled: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex size-11 items-center justify-center rounded-lg border border-border disabled:opacity-30"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d={arriba ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function Dato({ termino, children }: { termino: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2">
      <dt className="text-text-muted">{termino}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

function capitalizar(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
