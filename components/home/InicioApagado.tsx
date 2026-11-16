import Link from "next/link";
import { Encabezado, EnlaceBoton, Tarjeta, clases } from "@/components/emisor/ui";
import Toast from "@/components/emisor/Toast";
import RefrescarSolo from "@/components/emisor/RefrescarSolo";
import { listaNombres } from "@/app/aviso/_datos/formato";
import type { Frecuencia } from "@/app/aviso/_datos/tipos";
import { rellenar } from "@/components/aviso/textos";
import BarraNavegacion from "./BarraNavegacion";
import SincronizarNotificaciones from "./SincronizarNotificaciones";
import ConfirmacionHecha from "./ConfirmacionHecha";
import ControlAviso from "./ControlAviso";
import type { TextosInicio } from "./textosInicio";

function Nota({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-sm">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </svg>
      <span>{children}</span>
    </p>
  );
}

// E-02 · Inicio con el aviso apagado: "Esperando contactos" (nadie aceptó) o "Apagado" con el
// interruptor para encenderlo (hay al menos un contacto aceptado). También "Tu aviso se apagó"
// cuando se fue el último contacto aceptado (E-22).
export default function InicioApagado({
  t,
  app,
  nombre,
  pendientes,
  rechazados,
  sinEnviar,
  vacio,
  aceptados,
  aceptadosFuera = [],
  salieron = [],
  canceladaAhora,
  confirmadoEn,
  plazo,
  apagadoAhora,
}: {
  // "Solo hoy" recién confirmado (E1): el aviso se apagó. Hora guardada en el servidor.
  confirmadoEn?: string;
  aceptadosFuera?: string[];
  // Tras cancelar una falsa alarma: aviso breve ("Cancelaste la alerta").
  canceladaAhora?: string;
  // Quienes se dieron de baja desde su correo.
  salieron?: string[];
  t: TextosInicio;
  app: string;
  nombre: string;
  pendientes: string[];
  rechazados: string[];
  sinEnviar: string[];
  vacio: boolean;
  aceptados: string[];
  plazo: { fireAt: string; frecuencia: Frecuencia; dias: number[] };
  apagadoAhora: boolean;
}) {
  const hayAceptado = aceptados.length > 0;
  // Alguien aceptó pero no está dentro del aviso: no se puede encender todavía, pero no es "esperando".
  const hayFuera = !hayAceptado && aceptadosFuera.length > 0;
  return (
    <div className="fixed inset-0 mx-auto flex max-w-md flex-col bg-surface-muted">
      <main className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <SincronizarNotificaciones />
        {/* Si alguien acepta mientras tanto, Inicio se actualiza solo. */}
        <RefrescarSolo />
        {canceladaAhora && <Toast texto={canceladaAhora} quitarParametro="alerta" />}
        {apagadoAhora && <Toast texto={t.apagadoListo} quitarParametro="apagado" />}
        <Encabezado nombre={app} />
        <h1 className="text-2xl font-semibold">{nombre ? rellenar(t.hola, { nombre }) : t.holaSinNombre}</h1>
        {confirmadoEn && <ConfirmacionHecha t={t} confirmadoEn={confirmadoEn} proximo={null} />}
        <Tarjeta>
          {/* Jerarquía: 1) qué es (título y Editar), 2) en qué estado está y qué hacer, 3) avisos aparte. */}
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">{t.tuAviso}</h2>
            <Link href="/aviso" className={clases.enlace} aria-label={t.editarAria}>
              {t.editar}
            </Link>
          </div>

          {hayAceptado ? (
            <ControlAviso
              t={t}
              encendido={false}
              fireAt={plazo.fireAt}
              frecuencia={plazo.frecuencia}
              dias={plazo.dias}
              estado={t.apagado}
              detalle={rellenar(t.enciendelo, { nombres: listaNombres(aceptados) })}
            />
          ) : (
            <div className="space-y-1 rounded-lg bg-surface-muted p-3">
              <p className="font-semibold">{hayFuera ? t.apagado : t.esperando}</p>
              <p className="text-sm text-text-muted">
                {vacio
                  ? t.avisoSinContactos
                  : hayFuera
                    ? rellenar(aceptadosFuera.length === 1 ? t.aceptoFueraUno : t.aceptoFueraVarios, { nombres: listaNombres(aceptadosFuera) })
                    : `${t.podras} ${pendientes.length > 0 ? rellenar(pendientes.length === 1 ? t.aunNoUno : t.aunNoVarios, { nombres: listaNombres(pendientes) }) : ""}`.trim()}
              </p>
            </div>
          )}

          {/* Avisos: aparte, en letra normal y con icono. Con un aceptado (dentro o fuera del aviso) ya se puede avanzar:
              avisar de otra invitación sin enviar solo confunde. */}
          {(!hayAceptado && !hayFuera && sinEnviar.length > 0) || rechazados.length > 0 || salieron.length > 0 ? (
            <div className="space-y-2 border-t border-border/40 pt-3">
              {!hayAceptado && !hayFuera && sinEnviar.length > 0 && (
                <Nota>{rellenar(sinEnviar.length === 1 ? t.noEnviadaUno : t.noEnviadaVarios, { nombres: listaNombres(sinEnviar) })}</Nota>
              )}
              {salieron.length > 0 && <Nota>{rellenar(salieron.length === 1 ? t.salioUno : t.salioVarios, { nombres: listaNombres(salieron) })}</Nota>}
              {rechazados.length > 0 && <Nota>{rellenar(rechazados.length === 1 ? t.rechazoUno : t.rechazoVarios, { nombres: listaNombres(rechazados) })}</Nota>}
            </div>
          ) : null}

          {!hayAceptado && (
            <EnlaceBoton href="/contactos">
              {t.verContactos}
            </EnlaceBoton>
          )}
        </Tarjeta>
      </main>
      <BarraNavegacion t={t.nav} actual="inicio" />
    </div>
  );
}
