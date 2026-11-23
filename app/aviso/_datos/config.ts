import type { Variant } from "@/lib/brand";

// Fichero de configuración del flujo de quien emite (alta, contactos, aviso e inicio).
//
// ADAPTADOR DE DATOS EXTRA
// El diseño pide cuatro datos extra. Desde la migración 0010 ya tienen tabla:
//   - mensaje del aviso (hasta 300 caracteres)
//   - pasos a seguir (R6): desde el PRD del 12/11 son los contactos en orden; ya no se escriben
//   - días elegidos ("Elegir días")
//   - relación del contacto (Pareja, Papá…)
// Se leen y escriben en las tablas de la migración 0010 del núcleo (adaptador-supabase.ts).
export const CONFIG_EMISOR = {
  // Tiempo de gracia (E4): botones fijos más "Otro" (hasta 24 h).
  gracia: {
    opciones: [15, 30, 60],
    minimoMin: 15,
    maximoMin: 24 * 60,
  },

  // Tiempo que pasa sin respuesta antes de avisar al siguiente contacto (escalado). Solo importa con 2 o más.
  escalado: {
    opciones: [5, 10, 15, 30, 60, 120],
    porDefecto: 30,
  },

  // Minutos antes de la hora del aviso en que ya se puede confirmar "Estoy bien" (E-02: "Podrás confirmar
  // desde las 7:30 p. m." para un aviso de las 8:00 p. m.). Sale del wireflow, no del PRD: por validar.
  ventanaConfirmarMin: 30,

  mensajeMax: 300,
  contactosMax: 5,

  // Valores que cambian por versión (O1).
  porVersion: {
    cerca: {
      graciaPorDefecto: 30,
      horaPorDefecto: "20:00",
    },
    montana: {
      graciaPorDefecto: 120,
      horaPorDefecto: "20:00",
    },
  } satisfies Record<Variant, { graciaPorDefecto: number; horaPorDefecto: string }>,
};

export function configVersion(variant: Variant) {
  return CONFIG_EMISOR.porVersion[variant];
}
