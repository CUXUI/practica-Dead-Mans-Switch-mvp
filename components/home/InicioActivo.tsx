import { Badge, Encabezado, Tarjeta } from "@/components/emisor/ui";
import Toast from "@/components/emisor/Toast";
import { rellenar } from "@/components/aviso/textos";
import type { Frecuencia } from "@/app/aviso/_datos/tipos";
import BarraNavegacion from "./BarraNavegacion";
import SincronizarNotificaciones from "./SincronizarNotificaciones";
import ConfirmacionHecha from "./ConfirmacionHecha";
import ControlAviso from "./ControlAviso";
import EditarActivo from "./EditarActivo";
import PlazoActivo from "./PlazoActivo";
import type { TextosInicio } from "./textosInicio";

// E-02 · Inicio con el aviso encendido y sin alerta: el plazo, el interruptor, "Editar" (apaga primero)
// y "Estoy bien" (E1) dentro de la ventana para confirmar. Tras confirmar, la hora guardada y el próximo plazo.
export default function InicioActivo({
  t,
  app,
  nombre,
  plazo,
  encendidoAhora,
  confirmadoEn,
  graciaMin = 0,
}: {
  graciaMin?: number;
  // Hora de la confirmación recién guardada en el servidor (solo justo después de "Estoy bien").
  confirmadoEn?: string;
  t: TextosInicio;
  app: string;
  nombre: string;
  plazo: { fireAt: string; frecuencia: Frecuencia; dias: number[] };
  encendidoAhora: boolean;
}) {
  return (
    <div className="fixed inset-0 mx-auto flex max-w-md flex-col bg-surface-muted">
      <main className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <SincronizarNotificaciones />
        {encendidoAhora && <Toast texto={t.encendido} quitarParametro="encendido" />}
        <Encabezado nombre={app} />
        <h1 className="text-2xl font-semibold">{nombre ? rellenar(t.hola, { nombre }) : t.holaSinNombre}</h1>
        {confirmadoEn && <ConfirmacionHecha t={t} confirmadoEn={confirmadoEn} proximo={plazo.fireAt} />}
        <Tarjeta>
          {/* "Editar" siempre está: desactivado con el aviso encendido, se activa al apagarlo. */}
          <div className="flex items-center justify-between gap-2">
            <Badge>{t.activo}</Badge>
            <EditarActivo fireAt={plazo.fireAt} texto={t.editar} aria={t.editarAria} titulo={t.editarDesactivado} />
          </div>
          {/* El interruptor va junto al título "Tu aviso", y el plazo debajo. */}
          <ControlAviso t={t} encendido fireAt={plazo.fireAt} frecuencia={plazo.frecuencia} dias={plazo.dias} notaEditar={t.editarDesactivado} graciaMin={graciaMin} titulo={t.tuAviso}>
            <PlazoActivo t={t} fireAt={plazo.fireAt} frecuencia={plazo.frecuencia} dias={plazo.dias} />
          </ControlAviso>
        </Tarjeta>
      </main>
      <BarraNavegacion t={t.nav} actual="inicio" />
    </div>
  );
}
