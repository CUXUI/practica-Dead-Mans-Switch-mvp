import type { Variant } from "@/lib/brand";

// Fichero de configuración del flujo de quien emite (alta, contactos, aviso e inicio).
//
// ADAPTADOR DE DATOS EXTRA
// El diseño pide cuatro datos que todavía no tienen tabla en la base:
//   - mensaje del aviso (hasta 300 caracteres)
//   - pasos a seguir (R6)
//   - días elegidos ("Elegir días")
//   - relación del contacto (Pareja, Papá…)
// Mientras el núcleo no cree las tablas, se guardan en un fichero JSON local.
// Cuando existan, basta con cambiar `adaptadorExtras` a "supabase".
// No hay que tocar pantallas ni acciones.
export const CONFIG_EMISOR = {
  adaptadorExtras: "fichero" as "fichero" | "supabase",

  // Ruta del fichero JSON del adaptador "fichero" (ignorado por git).
  // En Vercel el disco es de solo lectura: este adaptador solo sirve en local.
  ficheroExtras: ".datos-locales/extras-emisor.json",

  // Tiempo de gracia (E4): botones fijos más "Otro" (hasta 24 h).
  gracia: {
    opciones: [15, 30, 60],
    minimoMin: 15,
    maximoMin: 24 * 60,
  },

  mensajeMax: 300,
  pasoMax: 200,
  pasosMax: 10,
  contactosMax: 5,

  // Valores que cambian por versión (O1).
  porVersion: {
    cerca: {
      graciaPorDefecto: 30,
      // Pasos a seguir obligatorios (decidido con Mariola el 10/11; el PRD los hacía opcionales).
      pasosObligatorios: true,
      horaPorDefecto: "20:00",
    },
    montana: {
      graciaPorDefecto: 120,
      pasosObligatorios: true,
      horaPorDefecto: "20:00",
    },
  } satisfies Record<Variant, { graciaPorDefecto: number; pasosObligatorios: boolean; horaPorDefecto: string }>,
};

export function configVersion(variant: Variant) {
  return CONFIG_EMISOR.porVersion[variant];
}
