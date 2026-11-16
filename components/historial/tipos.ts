// Forma de los datos del historial que viajan del servidor a la pantalla.
// Son datos simples (texto y números) para poder pasarlos a un componente de navegador.

export type TipoAviso = "routine" | "trip" | null;

export type Destinatario = {
  nombre: string;
  // Canales por los que se intentó avisar y si salió o no.
  canales: { canal: "push" | "email"; resultado: "sent" | "failed" | "bounced" }[];
  // Si abrió la alerta ("visto").
  visto: boolean;
};

export type EntradaConfirmacion = {
  tipo: "confirmacion";
  id: string;
  cuando: string; // ISO
  origen: "app" | "notification";
  aviso: TipoAviso;
};

export type EntradaAlerta = {
  tipo: "alerta";
  id: string;
  cuando: string; // ISO: cuándo se disparó
  resultado: "open" | "closed" | "unresolved";
  aviso: TipoAviso;
  cerradaEn: string | null; // ISO
  venceEn: string | null; // ISO
  destinatarios: Destinatario[];
};

export type EntradaHistorial = EntradaConfirmacion | EntradaAlerta;
