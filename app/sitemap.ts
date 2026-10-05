import type { MetadataRoute } from "next";
import { destinations } from "@/lib/destinations";
import { locales, localeMeta, defaultLocale } from "@/lib/i18n/config";
import { absUrl } from "@/lib/seo";

const pages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/book", priority: 0.9, changeFrequency: "monthly" },
  { path: "/destinations", priority: 0.9, changeFrequency: "weekly" },
  ...destinations.map((d) => ({ path: `/destinations/${d.slug}`, priority: d.region === "agadir" || d.region === "north" ? 0.85 : 0.75, changeFrequency: "monthly" as const })),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return pages.flatMap(({ path, priority, changeFrequency }) =>
    locales.map((locale) => ({
      url: absUrl(locale, path),
      lastModified,
      changeFrequency,
      priority: locale === defaultLocale ? priority : priority - 0.05,
      alternates: {
        languages: {
          ...Object.fromEntries(locales.map((l) => [localeMeta[l].hreflang, absUrl(l, path)])),
          "x-default": absUrl(defaultLocale, path),
        },
      },
    })),
  );
}
