import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import Icono, { type NombreIcono } from "./Icono";
import { boton, enlace } from "./estilos";

// Action Button (Figma 2200:1060). Tipo: Principal / Secundario. Estados: Normal, Hover, Presionado, Foco,
// Deshabilitado y Cargando. Alto mínimo 48, radio 12, Inter 16/24 Bold. Una sola acción principal por pantalla.
type PropsBoton = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  tipo?: "principal" | "secundario";
  type?: "button" | "submit";
  // Ícono a la izquierda del texto (slot de 24 × 24).
  icono?: NombreIcono;
  // Mientras espera al servidor: muestra el indicador, no se puede volver a tocar y avisa con aria-busy.
  cargando?: boolean;
  // Texto mientras carga ("Enviando…"). Sin él, se conserva el texto del botón.
  textoCargando?: string;
  // "completo" ocupa el ancho disponible (pantallas móviles). "contenido" se ajusta al texto.
  ancho?: "completo" | "contenido";
};

export function Boton({ tipo = "principal", type = "button", icono, cargando = false, textoCargando, ancho = "completo", className = "", children, disabled, ...rest }: PropsBoton) {
  const receta = ancho === "completo" ? boton[tipo] : boton[`${tipo}Ajustado`];
  return (
    <button type={type} disabled={disabled || cargando} aria-busy={cargando || undefined} className={`${receta} ${className}`} {...rest}>
      {cargando ? <Icono nombre="loader-circle" /> : icono ? <Icono nombre={icono} /> : null}
      <span>{cargando && textoCargando ? textoCargando : children}</span>
    </button>
  );
}

// El mismo Action Button cuando la acción es ir a otra pantalla (es un enlace, no un botón).
export function BotonEnlace({ href, tipo = "principal", icono, ancho = "completo", className = "", children }: { href: string; tipo?: "principal" | "secundario"; icono?: NombreIcono; ancho?: "completo" | "contenido"; className?: string; children: ReactNode }) {
  const receta = ancho === "completo" ? boton[tipo] : boton[`${tipo}Ajustado`];
  return (
    <Link href={href} className={`${receta} ${className}`}>
      {icono && <Icono nombre={icono} />}
      <span>{children}</span>
    </Link>
  );
}

// Botón ícono (Figma 3714:6064): 48 × 48. La etiqueta dice la acción y el objeto: «Subir a Ana».
export function BotonIcono({ icono, etiqueta, className = "", ...rest }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> & { icono: NombreIcono; etiqueta: string }) {
  return (
    <button type="button" aria-label={etiqueta} className={`${boton.icono} ${className}`} {...rest}>
      <Icono nombre={icono} />
    </button>
  );
}

// Botón de añadir (Figma 4118:35375): borde punteado, para el primer elemento de una lista vacía.
export function BotonAnadir({ children, className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`${boton.anadir} ${className}`} {...rest}>
      <Icono nombre="plus" />
      <span>{children}</span>
    </button>
  );
}

// Enlace y Enlace con ícono (Figma 3724:27503 y 3104:12560). El texto dice qué hace por sí solo.
export function Enlace({ href, icono, children, className = "", ...rest }: { href: string; icono?: NombreIcono; children: ReactNode; className?: string; "aria-label"?: string }) {
  return (
    <Link href={href} className={`${enlace} ${className}`} {...rest}>
      {icono && <Icono nombre={icono} tamano={20} />}
      {children}
    </Link>
  );
}
