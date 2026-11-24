// Recetas del design system (components/ds/estilos.ts). Este archivo queda como puente para el flujo de cuenta.
import { boton as botonDS, card } from "@/components/ds/estilos";

// Action Button de la Biblioteca (02 · Acciones).
export const boton = {
  principal: botonDS.principal,
  secundario: botonDS.secundario,
};

// Card con Contorno, densidad Normal: relleno 16/24, radio 16, borde sutil.
export const tarjeta = card("contorno", "normal");
