// Solo servidor (usa el disco). No importar desde un componente "use client".
import { promises as fs } from "node:fs";
import path from "node:path";
import { CONFIG_EMISOR } from "./config";
import type { AdaptadorExtras, ExtrasAviso } from "./tipos";

// Adaptador provisional: guarda los datos extra en un JSON local.
// Solo para desarrollo en local (en Vercel el disco es de solo lectura).

type Fichero = {
  avisos: Record<string, ExtrasAviso & { issuerId: string; actualizado: string }>;
  relaciones: Record<string, { issuerId: string; relacion: string }>;
};

const RUTA = path.resolve(process.cwd(), CONFIG_EMISOR.ficheroExtras);

async function leer(): Promise<Fichero> {
  try {
    const crudo = await fs.readFile(RUTA, "utf8");
    const datos = JSON.parse(crudo) as Partial<Fichero>;
    return { avisos: datos.avisos ?? {}, relaciones: datos.relaciones ?? {} };
  } catch {
    return { avisos: {}, relaciones: {} };
  }
}

// Las escrituras se encadenan para que dos peticiones a la vez no se pisen.
let cola: Promise<unknown> = Promise.resolve();

function modificar(cambio: (f: Fichero) => void): Promise<void> {
  const tarea = cola.then(async () => {
    const f = await leer();
    cambio(f);
    await fs.mkdir(path.dirname(RUTA), { recursive: true });
    const tmp = `${RUTA}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(f, null, 2), "utf8");
    await fs.rename(tmp, RUTA);
  });
  cola = tarea.catch(() => undefined);
  return tarea;
}

export const adaptadorFichero: AdaptadorExtras = {
  async leerAviso(issuerId, noticeId) {
    const f = await leer();
    const a = f.avisos[noticeId];
    if (!a || a.issuerId !== issuerId) return null;
    return { mensaje: a.mensaje, pasos: a.pasos, dias: a.dias };
  },

  async guardarAviso(issuerId, noticeId, extras) {
    await modificar((f) => {
      const previo = f.avisos[noticeId];
      if (previo && previo.issuerId !== issuerId) throw new Error("Aviso de otra persona");
      f.avisos[noticeId] = { ...extras, issuerId, actualizado: new Date().toISOString() };
    });
  },

  async leerRelaciones(issuerId, contactIds) {
    const f = await leer();
    const out: Record<string, string> = {};
    for (const id of contactIds) {
      const r = f.relaciones[id];
      if (r && r.issuerId === issuerId) out[id] = r.relacion;
    }
    return out;
  },

  async guardarRelacion(issuerId, contactId, relacion) {
    await modificar((f) => {
      const previo = f.relaciones[contactId];
      if (previo && previo.issuerId !== issuerId) throw new Error("Contacto de otra persona");
      if (relacion) f.relaciones[contactId] = { issuerId, relacion };
      else delete f.relaciones[contactId];
    });
  },
};
