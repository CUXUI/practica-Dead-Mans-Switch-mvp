"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { guardarAviso } from "@/app/aviso/actions";
import { DIAS, duracion, duracionLarga, horaCorta, horaLarga, listaNombres, primerNombre, proximoPlazo } from "@/app/aviso/_datos/formato";
import type { Frecuencia } from "@/app/aviso/_datos/tipos";
import { Badge, BarraTitulo, Numero, Pantalla, Progreso, Tarjeta, clases } from "@/components/emisor/ui";
import { rellenar, type TextosAviso } from "./textos";
import SelectorHora from "./SelectorHora";
import Spinner from "@/components/emisor/Spinner";

// E · Configurar aviso · Hora / Contactos → Resumen → Guardando → Inicio.
// Todo el asistente vive en una sola pantalla de cliente y se guarda al final (apagado).
// PRD 12/11 (R6): los "pasos a seguir" son los contactos en orden. Ya no se escriben a mano.

// enviada: la invitación salió de verdad. Si no, la persona no "aún no responde": no le llegó nada.
export type ContactoOpcion = { id: string; name: string; accepted: boolean; enviada: boolean; relacion: string | null };

export type Inicial = {
  fireAt: string | null;
  horaPorDefecto: string;
  frecuencia: Frecuencia;
  dias: number[];
  graciaMin: number;
  mensaje: string;
  contactos: string[];
};

type Limites = {
  graciaOpciones: number[];
  graciaMin: number;
  graciaMax: number;
  mensajeMax: number;
};

export type Paso = "hora" | "contactos" | "resumen";

const ORDEN: Paso[] = ["hora", "contactos", "resumen"];

export default function ConfigurarAviso({
  t,
  inicial,
  opciones,
  salieron = [],
  limites,
  volverHref,
  enAlta,
}: {
  // Nombres de quienes se dieron de baja desde su correo.
  salieron?: string[];
  t: TextosAviso;
  inicial: Inicial;
  opciones: ContactoOpcion[];
  limites: Limites;
  volverHref: string;
  // En el alta este asistente entero es el "Paso 3 de 3". Al editar, cuenta sus dos pantallas.
  enAlta: boolean;
}) {
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>("hora");

  const [hora, setHora] = useState(inicial.horaPorDefecto);
  const [frecuencia, setFrecuencia] = useState<Frecuencia>(inicial.frecuencia);
  const [dias, setDias] = useState<number[]>(inicial.dias);
  const esOtro = !limites.graciaOpciones.includes(inicial.graciaMin);
  const [graciaOtro, setGraciaOtro] = useState(esOtro);
  const [gracia, setGraciaLibre] = useState(inicial.graciaMin);
  // Nunca fuera de 15 min – 24 h: el selector no deja elegir un valor que luego dé error.
  const setGracia = (min: number) => setGraciaLibre(Math.min(limites.graciaMax, Math.max(limites.graciaMin, min)));
  // Tras mover un contacto, el foco sigue a ese contacto (la flecha pulsada puede desaparecer).
  const [focoTras, setFocoTras] = useState<{ id: string; arriba: boolean } | null>(null);
  const [mensaje, setMensaje] = useState(inicial.mensaje);
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

  useEffect(() => {
    if (!focoTras) return;
    const boton = (dir: string) => document.querySelector<HTMLButtonElement>(`[data-flecha="${focoTras.id}-${dir}"]:not(:disabled)`);
    (boton(focoTras.arriba ? "sube" : "baja") ?? boton(focoTras.arriba ? "baja" : "sube"))?.focus();
    setFocoTras(null);
  }, [focoTras]);

  // Minutos que se pueden elegir para las horas ya elegidas: sin "0" si con 0 horas quedaría por debajo del
  // mínimo (15 min), y sin 15, 30 ni 45 si ya se llegó al máximo (24 h). Así no hay opciones que no funcionan.
  const minutosPosibles = [0, 15, 30, 45].filter((m) => {
    const total = Math.floor(gracia / 60) * 60 + m;
    return total >= limites.graciaMin && total <= limites.graciaMax;
  });

  const porId = new Map(opciones.map((c) => [c.id, c]));
  const elegidos = enAviso.map((id) => porId.get(id)).filter((c): c is ContactoOpcion => !!c);
  const otros = opciones.filter((c) => !enAviso.includes(c.id));

  function ir(p: Paso) {
    setErrores({});
    setPaso(p);
  }

  // Al cambiar el dato que causó un error, ese error ya no aplica: se quita al momento.
  // Se vuelve a comprobar al pulsar "Continuar".
  function quitarError(...campos: string[]) {
    setErrores((prev) => {
      if (!campos.some((c) => c in prev)) return prev;
      const siguiente = { ...prev };
      for (const c of campos) delete siguiente[c];
      return siguiente;
    });
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

  // Solo se nombra a quien aceptó: no se promete un aviso que no llegaría.
  const nombresElegidos = elegidos.filter((c) => c.accepted).map((c) => primerNombre(c.name));
  const textoOrden =
    nombresElegidos.length === 0
      ? elegidos.length > 0
        ? t.contactos.nadieAcepto
        : ""
      : nombresElegidos.length === 1
        ? rellenar(t.contactos.ordenUno, { primero: nombresElegidos[0] })
        : rellenar(t.contactos.ordenVarios, { primero: nombresElegidos[0], resto: listaNombres(nombresElegidos.slice(1)) });

  // "Paso n de 3" es SOLO el contador del alta: 1 notificaciones, 2 contactos, 3 aviso.
  // Todo este asistente es el paso 3. Al editar un aviso ya creado no hay contador:
  // un "Paso 1 de 2" aquí se confundiría con el paso 1 del alta.
  const subtitulo = paso === "hora" ? t.hora.titulo : t.contactos.titulo;
  const cabecera = (
    <>
      <BarraTitulo titulo={paso === "resumen" ? t.resumen.titulo : t.titulo} onVolver={guardando ? undefined : atras} />
      {paso !== "resumen" && enAlta && <Progreso actual={3} total={3} />}
      <h2 ref={titulo} tabIndex={-1} className="sr-only">
        {paso === "resumen" ? t.resumen.titulo : enAlta ? `${t.titulo}, paso 3 de 3: ${subtitulo}` : `${t.titulo}: ${subtitulo}`}
      </h2>
    </>
  );

  // ---------- Paso 1 · Hora ----------
  if (paso === "hora") {
    return (
      <Pantalla
        pie={
          <button type="button" className={clases.principal} onClick={() => validarHora() && ir("contactos")}>
            {t.continuar}
          </button>
        }
      >
        {cabecera}
        <Tarjeta>
          <p id="hora-etiqueta" className={clases.etiqueta}>
            {t.hora.titulo}
          </p>
          <SelectorHora
            id="hora"
            valor={hora}
            onChange={(v) => {
              setHora(v);
              quitarError("hora");
            }}
            invalido={!!errores.hora}
            descritoPor={errores.hora ? "hora-error" : "hora-ayuda"}
            t={{ hora: t.hora.selHora, minutos: t.hora.selMinutos, momento: t.hora.selMomento }}
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
              onChange={(v) => {
                setFrecuencia(v as Frecuencia);
                quitarError("hora", "dias");
              }}
              opciones={[
                { valor: "once", label: t.hora.soloHoy },
                { valor: "daily", label: t.hora.aDiario },
                { valor: "weekly", label: t.hora.elegirDias },
              ]}
            />
            {frecuencia === "weekly" && (
              <div>
                <div className="flex flex-wrap gap-1" role="group" aria-label={t.hora.elegirDias}>
                  {DIAS.map((d) => (
                    <label key={d.valor} className={claseSegmento}>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={dias.includes(d.valor)}
                        aria-label={d.nombre}
                        onChange={(e) => {
                          setDias((prev) => (e.target.checked ? [...prev, d.valor] : prev.filter((x) => x !== d.valor)));
                          quitarError("hora", "dias");
                        }}
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
              <div className="grid grid-cols-[repeat(auto-fit,minmax(5.5rem,1fr))] gap-3">
                <div>
                  <label htmlFor="gracia-h" className="mb-1 block text-sm font-medium">
                    {t.hora.otroHoras}
                  </label>
                  <select
                    id="gracia-h"
                    className={clases.campo}
                    value={Math.floor(gracia / 60)}
                    onChange={(e) => setGracia(Number(e.target.value) * 60 + (gracia % 60))}
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
                    {minutosPosibles.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {graciaOtro && (
              <p className={clases.ayuda}>
                {rellenar(t.hora.graciaRango, { min: duracion(limites.graciaMin), max: duracion(limites.graciaMax) })}
              </p>
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
            {t.hora.mensaje} <span className="font-normal text-text-muted">{t.hora.opcional}</span>
          </label>
          <p id="mensaje-ayuda" className="text-text-muted">
            {t.hora.mensajeAyuda}
          </p>
          <textarea
            id="mensaje"
            rows={3}
            maxLength={limites.mensajeMax}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            aria-describedby="mensaje-ayuda mensaje-ejemplo"
            className={`${clases.campo} resize-none`}
          />
          <div className="flex items-start justify-between gap-3 text-sm text-text-muted">
            <p id="mensaje-ejemplo">{t.hora.mensajeEjemplo}</p>
            <p className="shrink-0">
              <span aria-hidden="true">
                {mensaje.length} / {limites.mensajeMax}
              </span>
              <span className="sr-only">
                {mensaje.length} de {limites.mensajeMax} caracteres
              </span>
            </p>
          </div>
        </Tarjeta>
      </Pantalla>
    );
  }

  // ---------- Paso 2 · Contactos del aviso (el orden son los pasos a seguir) ----------
  if (paso === "contactos") {
    const mover = (i: number, delta: number) => {
      setFocoTras({ id: enAviso[i], arriba: delta < 0 });
      setEnAviso((prev) => {
        const n = [...prev];
        [n[i], n[i + delta]] = [n[i + delta], n[i]];
        return n;
      });
    };
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
          {salieron.length > 0 && (
            <p className="font-medium">{rellenar(salieron.length === 1 ? t.contactos.salioUno : t.contactos.salioVarios, { nombres: listaNombres(salieron) })}</p>
          )}
          {textoOrden && <p className="text-text-muted">{textoOrden}</p>}
          {nombresElegidos.length > 0 && elegidos.some((c) => !c.accepted) && <p className="text-sm text-text-muted">{t.contactos.soloAceptados}</p>}
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
                  {!c.accepted && <p className="text-sm font-medium">{c.enviada ? t.contactos.pendiente : t.contactos.sinEnviar}</p>}
                  <button
                    type="button"
                    className={clases.enlace}
                    onClick={() => setEnAviso((prev) => prev.filter((id) => id !== c.id))}
                    aria-label={`${t.contactos.quitar}: ${c.name}`}
                  >
                    {t.contactos.quitar}
                  </button>
                </div>
                {/* PRD 12/11 (E5): las flechas solo existen con más de un contacto. La que no se puede usar se oculta, no se desactiva. */}
                {elegidos.length > 1 && (
                  <div className="flex flex-col gap-2">
                    <BotonFlecha arriba dato={`${c.id}-sube`} oculto={i === 0} label={rellenar(t.contactos.subir, { nombres: c.name })} onClick={() => mover(i, -1)} />
                    <BotonFlecha
                      dato={`${c.id}-baja`}
                      oculto={i === elegidos.length - 1}
                      label={rellenar(t.contactos.bajar, { nombres: c.name })}
                      onClick={() => mover(i, 1)}
                    />
                  </div>
                )}
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
                    {!c.accepted && <p className="text-sm font-medium">{c.enviada ? t.contactos.pendiente : t.contactos.sinEnviar}</p>}
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
  const pendientes = elegidos.filter((c) => !c.accepted && c.enviada).map((c) => primerNombre(c.name));
  const sinEnviar = elegidos.filter((c) => !c.accepted && !c.enviada).map((c) => primerNombre(c.name));

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
            {guardando ? (<span className="inline-flex items-center gap-2"><Spinner />{t.resumen.guardando}</span>) : t.resumen.guardar}
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
        {/* Si ya hay un aceptado, se puede encender: avisar de otra invitación sin enviar solo confunde. */}
        {!hayAceptado && sinEnviar.length > 0 && (
          <p className="font-medium">
            {rellenar(sinEnviar.length === 1 ? t.resumen.noEnviadaUno : t.resumen.noEnviadaVarios, { nombres: listaNombres(sinEnviar) })}
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
          {mensaje.trim() && <Dato termino={t.resumen.mensaje}>{mensaje.trim()}</Dato>}
        </dl>
      </Tarjeta>
      {/* PRD 12/11 (E3): contactos y pasos siempre visibles, sin nada que abrir. Los pasos son los
          contactos en orden: una sola lista numerada, cada contacto con su estado. Quien no aceptó
          no recibe el aviso, y se dice aquí para no prometer una alerta que no llegaría. */}
      <Tarjeta titulo={t.resumen.pasos} id="resumen-pasos">
        <p className="text-text-muted">{t.resumen.pasosTexto}</p>
        <ol className="space-y-3">
          {elegidos.map((c, i) => (
            <li key={c.id} className="flex items-start gap-3">
              <Numero n={i + 1} />
              <div className="min-w-0">
                {/* "Avisamos a…" solo para quien aceptó; del resto se muestra el nombre y por qué no recibe nada. */}
                <p className="font-medium">
                  {c.accepted
                    ? rellenar(elegidos.findIndex((x) => x.accepted) === i ? t.resumen.pasoPrimero : t.resumen.pasoSiguiente, { nombre: c.name })
                    : c.name}
                </p>
                <p className={`text-sm ${c.accepted ? "text-text-muted" : "font-medium"}`}>{c.accepted ? t.resumen.acepto : c.enviada ? t.resumen.pendiente : t.resumen.sinEnviar}</p>
              </div>
            </li>
          ))}
        </ol>
      </Tarjeta>
    </Pantalla>
  );
}

// ---------- Piezas ----------

// Cada segmento se queda como mínimo del ancho de su texto (min-w-fit) y comparte el resto con los demás (flex-1).
// Si no caben en una fila (zoom al 200 %), pasan a otra fila en vez de apretarse hasta pisarse o cortarse.
const claseSegmento =
  "flex min-h-12 min-w-fit flex-1 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface px-2 py-2 text-center font-medium [overflow-wrap:anywhere] has-[:checked]:bg-brand-primary has-[:checked]:text-brand-on-primary has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-primary";

export function Segmentado({
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
    <div className="flex flex-wrap gap-1">
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

// "oculto" deja el hueco (para que las dos flechas no bailen) pero no se ve ni se puede tocar ni enfocar.
function BotonFlecha({ arriba, oculto, label, dato, onClick }: { arriba?: boolean; oculto: boolean; label: string; dato: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-flecha={dato}
      disabled={oculto}
      aria-hidden={oculto || undefined}
      tabIndex={oculto ? -1 : undefined}
      aria-label={label}
      className={`inline-flex size-11 items-center justify-center rounded-lg border border-border ${oculto ? "invisible" : ""}`}
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
