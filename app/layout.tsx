import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getBrand } from "@/lib/brand";
import PwaRegister from "@/components/pwa/PwaRegister";

const brand = getBrand();

export const metadata: Metadata = {
  title: brand.name,
  description: brand.description,
  applicationName: brand.name,
  appleWebApp: { capable: true, title: brand.name, statusBarStyle: "default" },
  icons: { apple: "/icons/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: brand.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
