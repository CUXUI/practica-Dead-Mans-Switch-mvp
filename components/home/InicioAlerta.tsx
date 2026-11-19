import { Badge, Encabezado, Tarjeta } from "@/components/emisor/ui";
import { rellenar } from "@/components/aviso/textos";
import BarraNavegacion from "./BarraNavegacion";
import SincronizarNotificaciones from "./SincronizarNotificaciones";
import CancelarAlerta from "./CancelarAlerta";
import type { TextosHome } from "./textos";
import type { TextosInicio } from "./textosInicio";
import type { Frecuencia } from "@/app/aviso/_datos/tipos";

// Inicio con una alerta en curso (E-02 alerta / E-10). Quien emite ve solo el estado de ese momento
// y el botón para cancelar una falsa alarma (mantener 2 s). Sin línea de tiempo (decisión del 14/11).
// plazo: para que cancelar sepa cuándo vuelve el aviso si es una rutina (ver CancelarAlerta).
export default function InicioAlerta({
  t,
  textos,
  app,
  nombre,
  plazo,
}: {
  t: TextosInicio;
  textos: TextosHome;
  app: string;
  nombre: string;
  plazo?: { fireAt: string; frecuencia: Frecuencia; dias: number[] };
}) {
  return (
    <div className="fixed inset-0 mx-auto flex max-w-md flex-col bg-surface-muted">
      <main className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <SincronizarNotificaciones />
        <Encabezado nombre={app} />
        <h1 className="text-2xl font-semibold">{nombre ? rellenar(t.hola, { nombre }) : t.holaSinNombre}</h1>
        <Tarjeta>
          <div>
            <Badge>{t.alertaBadge}</Badge>
          </div>
          <h2 className="text-lg font-semibold">{textos.alertaTitulo}</h2>
          <p className="text-text-muted">{textos.alertaCuerpo}</p>
          <CancelarAlerta textos={textos} plazo={plazo} />
        </Tarjeta>
      </main>
      <BarraNavegacion t={t.nav} actual="inicio" />
    </div>
  );
}
