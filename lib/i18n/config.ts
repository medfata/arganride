export const locales = ["en", "fr", "de", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const localeMeta: Record<Locale, { label: string; short: string; hreflang: string; og: string }> = {
  en: { label: "English", short: "EN", hreflang: "en", og: "en_GB" },
  fr: { label: "Français", short: "FR", hreflang: "fr", og: "fr_FR" },
  de: { label: "Deutsch", short: "DE", hreflang: "de", og: "de_DE" },
  es: { label: "Español", short: "ES", hreflang: "es", og: "es_ES" },
};

export type Localized<T = string> = Record<Locale, T>;
