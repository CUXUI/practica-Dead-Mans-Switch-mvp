import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { scriptTema, temaPorDefecto } from "@/lib/ds/tema";
import { TOKENS } from "@/lib/ds/tokens";
import { getBrand } from "@/lib/brand";
import PwaRegister from "@/components/pwa/PwaRegister";

const brand = getBrand();

// Familia del design system (Figma: fuente/familia = Inter). next/font la sirve desde el propio dominio.
const inter = Inter({ subsets: ["latin"], variable: "--fuente-inter", display: "swap" });

export const metadata: Metadata = {
  // Cada pantalla pone su título: "Tus contactos · Cerca".
  title: { default: brand.name, template: `%s · ${brand.name}` },
  description: brand.description,
  applicationName: brand.name,
  appleWebApp: { capable: true, title: brand.name, statusBarStyle: "default" },
  icons: { apple: "/icons/icon-192.png" },
};

export const viewport: Viewport = {
  // La barra del navegador toma el color del Encabezado (fondo/superficie), igual en todas las marcas.
  themeColor: TOKENS.color["fondo/superficie"].valor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-tema lo puede cambiar el script de abajo antes de hidratar (tema elegido para una demo).
    <html lang="es" data-tema={temaPorDefecto()} className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema() }} />
      </head>
      <body className="min-h-dvh antialiased">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
