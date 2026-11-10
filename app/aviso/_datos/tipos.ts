// Datos del aviso que todavía no tienen tabla propia en la base (ver config.ts).
export type ExtrasAviso = {
  mensaje: string;
  pasos: string[];
  // Días de la semana elegidos con "Elegir días": 0 = domingo … 6 = sábado. Vacío si no aplica.
  dias: number[];
};

export const EXTRAS_VACIOS: ExtrasAviso = { mensaje: "", pasos: [], dias: [] };

// Contrato que cumplen los dos adaptadores (fichero local y Supabase).
// Todas las operaciones van filtradas por quien emite: nunca se lee ni escribe lo de otra persona.
export interface AdaptadorExtras {
  leerAviso(issuerId: string, noticeId: string): Promise<ExtrasAviso | null>;
  guardarAviso(issuerId: string, noticeId: string, extras: ExtrasAviso): Promise<void>;
  leerContactos(issuerId: string, contactIds: string[]): Promise<Record<string, DatosContacto>>;
  guardarRelacion(issuerId: string, contactId: string, relacion: string | null): Promise<void>;
  // Cuándo salió el último correo de invitación (null si falló). Sin esto no se puede decir "enviada".
  marcarInvitacion(issuerId: string, contactId: string, enviadaEn: string | null): Promise<void>;
}

// Datos del contacto que todavía no tienen tabla propia.
export type DatosContacto = {
  relacion: string | null;
  invitacionEnviadaEn: string | null;
};

export type Frecuencia = "once" | "daily" | "weekly";

export type ContactoAviso = {
  id: string;
  name: string;
  status: "pending" | "accepted" | "rejected" | "removed";
  relacion: string | null;
};
