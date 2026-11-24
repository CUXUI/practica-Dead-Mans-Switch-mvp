import { TEMAS, type Tema } from "./tokens";

// Tema de marca (marca blanca). El tema por defecto lo fija cada despliegue con NEXT_PUBLIC_TEMA
// (base | cerca | montana). Sin variable, la app sale en Base (escala de grises).
//
// Para demos: /design-system deja elegir un tema y lo guarda en este navegador; también se puede
// abrir cualquier pantalla con ?tema=montana. No toca datos ni cuentas: solo cambia data-tema en <html>.
export const CLAVE_TEMA = "ds-tema";

export function temaPorDefecto(): Tema {
  const v = process.env.NEXT_PUBLIC_TEMA;
  return (TEMAS as readonly string[]).includes(v ?? "") ? (v as Tema) : "base";
}

// Corre antes de pintar (en <head>) para que no se vea un salto de color.
export function scriptTema(): string {
  const validos = JSON.stringify(TEMAS);
  return `(function(){try{var v=${validos},d=document.documentElement,p=new URLSearchParams(location.search).get("tema"),t;if(p==="reset"){localStorage.removeItem("${CLAVE_TEMA}")}else if(p&&v.indexOf(p)>-1){localStorage.setItem("${CLAVE_TEMA}",p)}t=localStorage.getItem("${CLAVE_TEMA}");if(t&&v.indexOf(t)>-1){d.setAttribute("data-tema",t)}}catch(e){}})();`;
}
