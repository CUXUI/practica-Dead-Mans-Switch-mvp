import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { getBrand } from "@/lib/brand";
import { COOKIE_MARCA_COLOR, claseMarcaColor, leerMarcaColor } from "@/lib/marca-color";
import PwaRegister from "@/components/pwa/PwaRegister";

const brand = getBrand();

export const metadata: Metadata = {
  // Cada pantalla pone su título: "Tus contactos · Cerca".
  title: { default: brand.name, template: `%s · ${brand.name}` },
  description: brand.description,
  applicationName: brand.name,
  appleWebApp: { capable: true, title: brand.name, statusBarStyle: "default" },
  icons: { icon: "/icons/app-icon.svg", apple: "/icons/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: brand.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // El color de marca elegido en Ajustes viaja en una cookie: se aplica en el servidor, antes de pintar.
  const almacen = await cookies();
  const clase = claseMarcaColor(leerMarcaColor(almacen.get(COOKIE_MARCA_COLOR)?.value));
  return (
    <html lang="es" className={clase || undefined}>
      <body className="min-h-dvh antialiased">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
