// Solo navegador. Marca de "apagué las notificaciones en este dispositivo" (Ajustes → Tu cuenta).
// Mientras esté puesta, Inicio no vuelve a registrar el dispositivo solo (SincronizarNotificaciones).
// Es por dispositivo, igual que el permiso del navegador y la suscripción push.
const CLAVE = "dms-push-apagadas";

export function notificacionesApagadasAqui(): boolean {
  try {
    return localStorage.getItem(CLAVE) === "1";
  } catch {
    return false;
  }
}

export function marcarNotificacionesApagadas(apagadas: boolean) {
  try {
    if (apagadas) localStorage.setItem(CLAVE, "1");
    else localStorage.removeItem(CLAVE);
  } catch {
    // Sin almacenamiento: el interruptor sigue funcionando, solo que Inicio podría volver a registrar.
  }
}
