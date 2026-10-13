import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — Agadir Airport Transfers`,
    short_name: site.name,
    description: "Private taxi transfers from Agadir Al Massira Airport to Agadir, Taghazout, Imsouane, Essaouira and the Souss coast.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f0e5",
    theme_color: "#17251c",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
