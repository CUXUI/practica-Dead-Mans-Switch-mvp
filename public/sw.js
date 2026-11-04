// Service worker mínimo del núcleo.
// Hace la app instalable. NO cachea páginas ni respuestas de la API:
// la confirmación (E1) nunca debe mostrarse como hecha sin que el servidor la reciba.
// El flujo de notificaciones push se agrega encima de este archivo (ver AGENTS.md).

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Handler de fetch requerido por algunos navegadores para considerar la app instalable.
// Pasa todo directo a la red.
self.addEventListener("fetch", () => {});
