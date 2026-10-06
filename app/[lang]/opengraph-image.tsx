import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ogCard, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Aga Taxi — Agadir Airport private transfers";

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(hasLocale(lang) ? lang : "en");
  return ogCard({ image: "hero-taghazout", kicker: dict.hero.kicker, title: `${dict.hero.title} ${dict.hero.titleEm}`, pill: "AGA → Agadir · €25" });
}
