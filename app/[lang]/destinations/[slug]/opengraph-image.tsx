import { getDestination } from "@/lib/destinations";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { t } from "@/lib/i18n/format";
import { ogCard, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Agadir Airport transfer";

export default async function Image({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const d = getDestination(slug) ?? getDestination("agadir")!;
  const dict = await getDictionary(hasLocale(lang) ? lang : "en");
  return ogCard({
    image: d.image,
    kicker: dict.destinationPage.lead,
    title: t(dict.destinationPage.h1, { name: d.name }),
    pill: `${dict.destinationsSection.from} €${d.priceEur} · ${d.km} km`,
  });
}
