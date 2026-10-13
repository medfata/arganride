import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { destinations, getDestination } from "@/lib/destinations";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatDuration, t } from "@/lib/i18n/format";
import { imageCredits } from "@/lib/images";
import { ROUND_TRIP_DISCOUNT, formatMoney, vehicleOrder, vehicles } from "@/lib/pricing";
import { absUrl, pageMetadata } from "@/lib/seo";
import { destinationGraph, faqGraph } from "@/lib/structured-data";
import { DestinationCard } from "@/components/DestinationCard";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { QuickQuote } from "@/components/QuickQuote";
import { Vehicle } from "@/components/Vehicle";
import { IconArrow, IconCheck, IconClock, IconRoad, IconTag } from "@/components/Icons";

export const dynamicParams = false;

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

async function load(params: PageProps<"/[lang]/destinations/[slug]">["params"]) {
  const { lang, slug } = await params;
  const d = getDestination(slug);
  if (!hasLocale(lang) || !d) return null;
  const dict = await getDictionary(lang);
  const ds = dict.destinationsSection;
  const money = (eur: number) => formatMoney(eur, "EUR", lang);
  const time = formatDuration(d.minutes, { minutes: ds.minutes, hours: ds.hours });
  const vars = {
    name: d.name,
    km: d.km,
    time,
    price: money(d.priceEur),
    van: money(Math.round(d.priceEur * vehicles.van.multiplier)),
  };
  return { lang, d, dict, ds, money, time, vars };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/destinations/[slug]">): Promise<Metadata> {
  const data = await load(params);
  if (!data) return {};
  const { lang, d, dict, vars } = data;
  return pageMetadata({
    locale: lang,
    path: `/destinations/${d.slug}`,
    title: t(dict.destinationPage.title, vars),
    description: t(dict.destinationPage.description, vars),
    keywords: [`Agadir airport ${d.name}`, `taxi Agadir ${d.name}`, `${d.name} transfer`, ...d.aliases.slice(0, 4)],
  });
}

export default async function DestinationPage({ params }: PageProps<"/[lang]/destinations/[slug]">) {
  const data = await load(params);
  if (!data) notFound();
  const { lang, d, dict, ds, money, time, vars } = data;
  const p = dict.destinationPage;
  const faq = p.faq.map((f) => ({ q: t(f.q, vars), a: t(f.a, vars) }));
  const credit = imageCredits[d.image];
  const others = destinations
    .filter((x) => x.slug !== d.slug)
    .sort((a, b) => Math.hypot(a.lat - d.lat, a.lng - d.lng) - Math.hypot(b.lat - d.lat, b.lng - d.lng))
    .slice(0, 3);
  const dur = { minutes: ds.minutes, hours: ds.hours };

  return (
    <>
      <JsonLd
        data={destinationGraph(lang, d, t(p.h1, vars), t(p.description, vars), [
          { name: dict.nav.home, url: absUrl(lang) },
          { name: dict.destinationsPage.h1, url: absUrl(lang, "/destinations") },
          { name: d.name, url: absUrl(lang, `/destinations/${d.slug}`) },
        ])}
      />
      <JsonLd data={faqGraph(faq)} />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-paper">
        <Image src={`/images/${d.image}.webp`} alt={d.name} fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/55 to-ink/20" />
        <div className="container-x pb-14 pt-24 sm:pt-40">
          <nav aria-label="Breadcrumb" className="text-sm text-paper/70">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href={`/${lang}`} className="hover:text-white">{dict.nav.home}</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href={`/${lang}/destinations`} className="hover:text-white">{dict.destinationsPage.h1}</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-paper">{d.name}</li>
            </ol>
          </nav>
          <p className="eyebrow mt-8 !text-saffron">{p.lead}</p>
          <h1 className="mt-4 max-w-4xl text-balance font-display text-5xl leading-[0.98] tracking-tight sm:text-7xl">{t(p.h1, vars)}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/80">{d.blurb[lang]}</p>
          <dl className="mt-10 grid max-w-3xl grid-cols-3 gap-px overflow-hidden rounded-3xl bg-white/15 backdrop-blur">
            {[
              [IconRoad, p.distance, t(ds.km, { n: d.km })],
              [IconClock, p.duration, time],
              [IconTag, p.priceFrom, money(d.priceEur), money(d.listEur)],
            ].map(([Icon, k, v, was]) => {
              const I = Icon as typeof IconRoad;
              return (
                <div key={k as string} className="bg-ink/50 p-4 sm:p-6">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-paper/60">
                    <I className="h-4 w-4 text-saffron" /> {k as string}
                  </dt>
                  <dd className="mt-2 font-display text-2xl sm:text-4xl">
                    {was && <s className="mr-2 align-middle font-sans text-sm text-paper/55 sm:text-base">{was as string}</s>}
                    {v as string}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
        {credit && (
          <p className="absolute bottom-2 right-3 text-[10px] text-paper/40">
            © {credit.author} · {credit.license}
          </p>
        )}
      </section>

      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1fr_23rem] lg:py-20">
        <div className="min-w-0">
          {/* Prices */}
          <section aria-labelledby="prices">
            <h2 id="prices" className="font-display text-4xl sm:text-5xl">{t(p.pricesTitle, vars)}</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {vehicleOrder.map((v) => {
                const one = Math.round(d.priceEur * vehicles[v].multiplier);
                const regular = Math.round(d.listEur * vehicles[v].multiplier);
                const round = Math.round(one * 2 * (1 - ROUND_TRIP_DISCOUNT));
                return (
                  <article key={v} className="card flex flex-col p-5">
                    <div className="rounded-2xl bg-sand px-3 pb-1 pt-4">
                      <Vehicle id={v} />
                    </div>
                    <h3 className="mt-4 font-display text-2xl">{dict.fleet.vehicles[v].name}</h3>
                    <p className="text-sm text-muted">
                      {t(dict.fleet.seats, { n: vehicles[v].seats })} · {t(dict.fleet.bags, { n: vehicles[v].bags })}
                    </p>
                    <dl className="mt-4 space-y-1.5 border-t border-ink/10 pt-4 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-ink/70">{p.oneWay}</dt>
                        <dd className="font-display text-2xl">
                          <s className="mr-1.5 align-middle font-sans text-sm text-muted">{money(regular)}</s>
                          {money(one)}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-ink/70">{p.roundTrip}</dt>
                        <dd className="font-semibold">{money(round)}</dd>
                      </div>
                    </dl>
                    <Link href={`/${lang}/book?to=${d.slug}&pax=${Math.min(vehicles[v].seats, v === "car" ? 2 : vehicles[v].seats)}`} className="btn btn-ghost mt-4 !py-3 text-sm">
                      {ds.book}
                    </Link>
                  </article>
                );
              })}
            </div>

            <div className="mt-8 rounded-[1.75rem] bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{p.included}</h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {p.includedItems.map((i) => (
                  <li key={i} className="flex items-start gap-3">
                    <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-ocean" /> {i}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-16" aria-labelledby="about">
            <h2 id="about" className="font-display text-4xl">{t(p.aboutTitle, vars)}</h2>
            <div className="prose-soft mt-5 max-w-2xl text-lg leading-relaxed text-ink/75">
              <p>{t(p.about, vars)}</p>
              <p>{d.blurb[lang]}</p>
            </div>
            {d.aliases.length > 1 && (
              <ul className="mt-6 flex flex-wrap gap-2" aria-label={d.name}>
                {d.aliases.map((a) => (
                  <li key={a} className="rounded-full bg-sand-2/70 px-3 py-1 text-sm">
                    {a}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-16" aria-labelledby="dest-faq">
            <h2 id="dest-faq" className="mb-6 font-display text-4xl">{p.faqTitle}</h2>
            <Faq items={faq} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <QuickQuote
            locale={lang}
            initial={d.slug}
            labels={{
              ...dict.quick,
              regular: dict.promo.regular,
              vehicles: { car: dict.fleet.vehicles.car.name, van: dict.fleet.vehicles.van.name, minibus: dict.fleet.vehicles.minibus.name },
              regions: dict.regions,
            }}
          />
        </aside>
      </div>

      <section className="bg-sand-2/50 py-16 lg:py-20">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-4xl">{p.other}</h2>
            <Link href={`/${lang}/destinations`} className="btn btn-ghost">
              {ds.viewAll} <IconArrow className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <DestinationCard key={o.slug} d={o} locale={lang} labels={{ from: ds.from, km: ds.km, ...dur }} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
