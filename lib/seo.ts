import type { Metadata } from "next";
import { locales, localeMeta, defaultLocale, type Locale } from "./i18n/config";
import { site } from "./site";

/** Absolute URL for a locale-relative path such as "/book". */
export const absUrl = (locale: Locale, path = "") => `${site.url}/${locale}${path === "/" ? "" : path}`;

export function alternates(locale: Locale, path = ""): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[localeMeta[l].hreflang] = absUrl(l, path);
  languages["x-default"] = absUrl(defaultLocale, path);
  return { canonical: absUrl(locale, path), languages };
}

export function pageMetadata({
  locale,
  path = "",
  title,
  description,
  keywords,
  image,
}: {
  locale: Locale;
  path?: string;
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
}): Metadata {
  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: alternates(locale, path),
    openGraph: {
      type: "website",
      siteName: site.name,
      url: absUrl(locale, path),
      title,
      description,
      locale: localeMeta[locale].og,
      alternateLocale: locales.filter((l) => l !== locale).map((l) => localeMeta[l].og),
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: title }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description, ...(image ? { images: [image] } : {}) },
  };
}

export const jsonLdScript = (data: unknown) => JSON.stringify(data).replace(/</g, "\u003c");
