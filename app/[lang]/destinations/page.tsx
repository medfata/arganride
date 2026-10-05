import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { destinations, regionOrder } from "@/lib/destinations";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatDuration, t } from "@/lib/i18n/format";
import { formatMoney, vehicles } from "@/lib/pricing";
import { absUrl, pageMetadata } from "@/lib/seo";
import { breadcrumbs } from "@/lib/structured-data";
import { DestinationCard } from "@/components/DestinationCard";
import { JsonLd } from "@/components/JsonLd";
import { IconArrow } from "@/components/Icons";

export async function generateMetadata({ params }: PageProps<"/[lang]/destinations">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata({ locale: lang, path: "/destinations", title: dict.destinationsPage.title, description: dict.destinationsPage.description });
}

export default async function DestinationsPage({ params }: PageProps<"/[lang]/destinations">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const p = dict.destinationsPage;
  const ds = dict.destinationsSection;
  const dur = { minutes: ds.minutes, hours: ds.hours };
  const money = (eur: number) => formatMoney(eur, "EUR", lang);
  const sorted = [...destinations].sort((a, b) => a.km - b.km);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            breadcrumbs([
              { name: dict.nav.home, url: absUrl(lang) },
              { name: p.h1, url: absUrl(lang, "/destinations") },
            ]),
            {
              "@type": "ItemList",
              name: p.title,
              itemListElement: sorted.map((d, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: absUrl(lang, `/destinations/${d.slug}`),
                name: `Agadir Airport → ${d.name}`,
              })),
            },
          ],
        }}
      />

      <section className="relative overflow-hidden bg-ink text-paper">
        <Image src="/images/marina-panorama.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 to-ink" />
        <div className="container-x relative pb-16 pt-20 sm:pt-28">
          <p className="eyebrow !text-saffron">AGA → Souss-Massa</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1] tracking-tight sm:text-7xl">{p.h1}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/75">{p.intro}</p>
        </div>
      </section>

      {/* Price table */}
      <section className="container-x -mt-2 py-14">
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm sm:text-base">
            <caption className="sr-only">{p.title}</caption>
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-[0.14em] text-muted">
                <th scope="col" className="px-5 py-4 font-bold">{p.destination}</th>
                <th scope="col" className="px-3 py-4 font-bold">{p.distance}</th>
                <th scope="col" className="px-3 py-4 font-bold">{p.time}</th>
                <th scope="col" className="px-3 py-4 text-right font-bold">{p.car}</th>
                <th scope="col" className="px-3 py-4 text-right font-bold">{p.van}</th>
                <th scope="col" className="px-5 py-4 text-right font-bold">{p.minibus}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((d) => (
                <tr key={d.slug} className="group border-b border-ink/5 last:border-0 hover:bg-sand/60">
                  <th scope="row" className="px-5 py-3.5 font-semibold">
                    <Link href={`/${lang}/destinations/${d.slug}`} className="inline-flex items-center gap-2 hover:text-terracotta">
                      {d.name}
                      <IconArrow className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                    </Link>
                  </th>
                  <td className="px-3 py-3.5 tabular-nums text-ink/70">{t(ds.km, { n: d.km })}</td>
                  <td className="px-3 py-3.5 tabular-nums text-ink/70">{formatDuration(d.minutes, dur)}</td>
                  <td className="px-3 py-3.5 text-right font-display text-xl tabular-nums">{money(d.priceEur)}</td>
                  <td className="px-3 py-3.5 text-right tabular-nums">{money(Math.round(d.priceEur * vehicles.van.multiplier))}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums">{money(Math.round(d.priceEur * vehicles.minibus.multiplier))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {regionOrder.map((r) => (
        <section key={r} className="container-x pb-16" aria-labelledby={`region-${r}`}>
          <h2 id={`region-${r}`} className="font-display text-3xl sm:text-4xl">
            {dict.regions[r]}
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinations
              .filter((d) => d.region === r)
              .map((d) => (
                <div key={d.slug}>
                  <DestinationCard d={d} locale={lang} labels={{ from: ds.from, km: ds.km, ...dur }} />
                  <p className="mt-3 px-3 text-sm leading-relaxed text-ink/70">{d.blurb[lang]}</p>
                </div>
              ))}
          </div>
        </section>
      ))}
    </>
  );
}
