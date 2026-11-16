// Forma de los datos del historial que viajan del servidor a la pantalla.
// Son datos simples (texto y números) para poder pasarlos a un componente de navegador.

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
};

export type EntradaAlerta = {
  tipo: "alerta";
  id: string;
  cuando: string; // ISO
  resultado: "open" | "closed" | "unresolved";
  destinatarios: Destinatario[];
};

export type EntradaHistorial = EntradaConfirmacion | EntradaAlerta;
