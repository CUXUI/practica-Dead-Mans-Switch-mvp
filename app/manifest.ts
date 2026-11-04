import type { MetadataRoute } from "next";
import { getBrand } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  const brand = getBrand();
  return {
    name: brand.name,
    short_name: brand.name,
    description: brand.description,
    start_url: "/home",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: brand.themeColor,
    lang: "es",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
