import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PRUEBA (pendiente de aprobación del núcleo): Next 15.5 envía <title>, <meta> y <link rel="manifest"> en
  // streaming dentro del <body>. Chrome/Edge solo leen el manifest desde el <head>, así que la app no se
  // detecta como instalable ("No manifest detected") y el botón Instalar nunca recibe beforeinstallprompt.
  // Con esta expresión todos los navegadores reciben las etiquetas bloqueantes, ya en el <head>.
  htmlLimitedBots: /.*/,
  async headers() {
    return [
      {
        // El service worker debe poder actualizarse siempre
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
