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

// Notificaciones push del aviso (E-push). Muestra el título y abre la app al tocarla.
self.addEventListener("push", (event) => {
  let data = { title: "Aviso", body: "Se disparó tu aviso.", url: "/home" };
  try {
    data = { ...data, ...event.data.json() };
  } catch {
    // Payload vacío o no JSON: se usa el texto por defecto.
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/home";
  event.waitUntil(self.clients.openWindow(url));
});
