// Datos que la pantalla de la alerta necesita para quien recibe.
// Quien recibe no tiene cuenta: estos datos llegan por una función del núcleo que valida
// el token (pregunta abierta para el núcleo; ver docs/ESQUEMA.md). La página nunca consulta tablas.

export type PasoAlerta = { orden: number; texto: string; detalle?: string };

export type DatosAlerta = {
  // Los cinco estados de R2. Los calcula get_alert_view (migración 0015).
  estado: "enviada" | "alguien_la_vio" | "sin_respuesta" | "cerrada" | "sin_resolver";
  nombreQuienEmite: string;
  telefonoQuienEmite: string | null; // solo dígitos internacionales, ej. "5491112345678"
  minutosAbierta: number;
  horaDeberiaConfirmar: string; // "8:00 p. m."
  ultimaConfirmacion: { cuando: string } | null; // "ayer a las 7:48 p. m."
  pasos: PasoAlerta[];
  // Mensaje opcional que quien emite dejó para sus contactos. null si no escribió ninguno.
  mensaje: string | null;
};
