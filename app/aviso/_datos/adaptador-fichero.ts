// Solo servidor (usa el disco). No importar desde un componente "use client".
import { promises as fs } from "node:fs";
import path from "node:path";
import { CONFIG_EMISOR } from "./config";
import type { AdaptadorExtras, DatosContacto, ExtrasAviso } from "./tipos";

// Adaptador provisional: guarda los datos extra en un JSON local.
// Solo para desarrollo en local (en Vercel el disco es de solo lectura).

type Fichero = {
  avisos: Record<string, ExtrasAviso & { issuerId: string; actualizado: string }>;
  contactos: Record<string, DatosContacto & { issuerId: string }>;
};

const RUTA = path.resolve(process.cwd(), CONFIG_EMISOR.ficheroExtras);

async function leer(): Promise<Fichero> {
  try {
    const crudo = await fs.readFile(RUTA, "utf8");
    const datos = JSON.parse(crudo) as Partial<Fichero>;
    return { avisos: datos.avisos ?? {}, contactos: datos.contactos ?? {} };
  } catch {
    return { avisos: {}, contactos: {} };
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

function contacto(f: Fichero, issuerId: string, contactId: string) {
  const previo = f.contactos[contactId];
  if (previo && previo.issuerId !== issuerId) throw new Error("Contacto de otra persona");
  return previo ?? { issuerId, relacion: null, invitacionEnviadaEn: null };
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

  async leerContactos(issuerId, contactIds) {
    const f = await leer();
    const out: Record<string, DatosContacto> = {};
    for (const id of contactIds) {
      const c = f.contactos[id];
      if (c && c.issuerId === issuerId) out[id] = { relacion: c.relacion, invitacionEnviadaEn: c.invitacionEnviadaEn };
    }
    return out;
  },

  async guardarRelacion(issuerId, contactId, relacion) {
    await modificar((f) => {
      f.contactos[contactId] = { ...contacto(f, issuerId, contactId), relacion };
    });
  },

  async marcarInvitacion(issuerId, contactId, enviadaEn) {
    await modificar((f) => {
      f.contactos[contactId] = { ...contacto(f, issuerId, contactId), invitacionEnviadaEn: enviadaEn };
    });
  },
};
