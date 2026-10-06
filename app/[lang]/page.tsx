import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { destinations } from "@/lib/destinations";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatDuration, t } from "@/lib/i18n/format";
import { img } from "@/lib/images";
import { EXTRA_BAG_EUR, OVERSIZE_ITEM_EUR, formatMoney, vehicleOrder, vehicles } from "@/lib/pricing";
import { pageMetadata } from "@/lib/seo";
import { whatsappLink } from "@/lib/site";
import { faqGraph } from "@/lib/structured-data";
import { QuickQuote } from "@/components/QuickQuote";
import { FlapBoard } from "@/components/FlapBoard";
import { CoastMap } from "@/components/CoastMap";
import { DestinationCard } from "@/components/DestinationCard";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { SectionHeading } from "@/components/SectionHeading";
import { Vehicle } from "@/components/Vehicle";
import { IconArrow, IconBag, IconCheck, IconRadar, IconSign, IconTag, IconWhatsapp } from "@/components/Icons";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata({ locale: lang, title: dict.meta.title, description: dict.meta.description, keywords: dict.meta.keywords });
}

const featured = ["agadir", "taghazout", "tamraght", "imsouane", "paradise-valley", "essaouira"];
const trustIcons = [IconSign, IconRadar, IconTag, IconBag];

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const ds = dict.destinationsSection;
  const hero = img("hero-bay");
  const dur = { minutes: ds.minutes, hours: ds.hours };

  const boardRows = [...destinations]
    .sort((a, b) => a.km - b.km)
    .map((d) => ({
      dest: d.name.split(" & ")[0].replace(" Resorts", ""),
      drive: formatDuration(d.minutes, { minutes: "{n} MIN", hours: "{h}H{m}" }),
      price: `€${d.priceEur}`,
    }));

  return (
    <>
      <JsonLd data={faqGraph(dict.faq.items)} />

      {/* ───────────── Hero ───────────── */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-10 h-[30rem] w-[30rem] rounded-full bg-ocean-2/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 right-1/4 h-[26rem] w-[26rem] rounded-full bg-saffron/15 blur-3xl" />
        <div className="container-x relative grid items-center gap-10 pb-20 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:pb-28 lg:pt-14">
          <div className="relative z-10 flex flex-col justify-center">
            <h1>
              <span className="eyebrow animate-rise">{dict.hero.kicker}</span>
              <span className="mt-6 block animate-rise font-display text-[3.4rem] leading-[0.95] tracking-[-0.02em] text-ink [animation-delay:.08s] sm:text-7xl lg:text-[5.4rem] xl:text-[6rem]">
                {dict.hero.title}{" "}
                <em className="relative inline-block not-italic text-primary">
                  {dict.hero.titleEm}
                  <svg aria-hidden="true" viewBox="0 0 300 20" className="absolute -bottom-2 left-0 h-3 w-full text-saffron" preserveAspectRatio="none">
                    <path d="M2 14c40-10 80-10 120-2s90 8 176-6" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                  </svg>
                </em>
              </span>
            </h1>
            <p className="mt-8 max-w-xl animate-rise lg:max-w-[30rem] xl:max-w-xl text-pretty text-lg leading-relaxed text-ink/75 [animation-delay:.16s] sm:text-xl">
              {dict.hero.subtitle}
            </p>
            <div className="mt-8 flex animate-rise flex-wrap gap-3 [animation-delay:.24s]">
              <Link href={`/${lang}/book`} className="btn btn-primary">
                {dict.hero.ctaPrimary} <IconArrow className="h-4 w-4" />
              </Link>
              <Link href={`/${lang}/destinations`} className="btn btn-ghost">
                {dict.hero.ctaSecondary}
              </Link>
            </div>
            <ul className="mt-9 flex animate-rise flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-ink/80 [animation-delay:.32s]">
              {dict.hero.badges.map((b) => (
                <li key={b} className="inline-flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-ocean text-white">
                    <IconCheck className="h-3 w-3" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative lg:pl-6">
            <figure className="arch relative mx-auto aspect-[4/3] w-full max-w-[34rem] animate-rise shadow-[0_50px_100px_-50px_rgba(11,34,51,.7)] [animation-delay:.1s] sm:aspect-[16/11] lg:aspect-[4/5]">
              <Image src={hero.src} alt={dict.hero.photoCaption} fill priority sizes="(min-width:1024px) 520px, 92vw" className="object-cover object-[50%_45%] lg:object-[58%_50%]" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/40" />
              <figcaption className="absolute bottom-5 right-6 text-xs font-medium tracking-wide text-paper/85">{dict.hero.photoCaption}</figcaption>
              <span aria-hidden="true" className="absolute right-5 top-[22%] hidden font-tifinagh lg:block text-2xl tracking-[0.3em] text-paper/80 [text-orientation:upright] [writing-mode:vertical-rl]">
                ⴰⴳⴰⴷⵉⵔ
              </span>
            </figure>
          </div>
        </div>
      </section>

      {/* Booking bar straddles the hero and the dark band below, keeping the photo fully visible. */}
      <div className="container-x relative z-20 -mt-12 -mb-24 animate-rise [animation-delay:.3s] lg:-mt-16 lg:-mb-14">
        <QuickQuote
          variant="bar"
          locale={lang}
          labels={{
            ...dict.quick,
            vehicles: { car: dict.fleet.vehicles.car.name, van: dict.fleet.vehicles.van.name, minibus: dict.fleet.vehicles.minibus.name },
            regions: dict.regions,
          }}
        />
      </div>

      {/* ───────────── Arrivals board + trust ───────────── */}
      <section className="relative overflow-hidden bg-ink pb-20 pt-40 text-paper lg:pb-28 lg:pt-36" aria-labelledby="board-title">
        <div className="zellige pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden="true" />
        <div className="container-x relative">
          <div className="grid items-end gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="reveal">
              <p className="eyebrow !text-saffron">AGA · GMAD</p>
              <h2 id="board-title" className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
                {dict.board.title}
              </h2>
              <p className="mt-4 max-w-md text-paper/70">{dict.board.caption}</p>
            </div>
            <div className="reveal">
              <FlapBoard
                rows={boardRows}
                statuses={dict.board.statuses}
                headers={{ destination: dict.board.destination, drive: dict.board.drive, price: dict.board.price, status: dict.board.status }}
              />
            </div>
          </div>

          <h2 className="sr-only">{dict.trust.title}</h2>
          <ul className="mt-16 grid gap-px overflow-hidden rounded-[1.75rem] bg-white/10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
            {dict.trust.items.map((item, i) => {
              const Icon = trustIcons[i];
              return (
                <li key={item.title} className="reveal bg-ink p-7">
                  <Icon className="h-7 w-7 text-saffron" />
                  <h3 className="mt-5 font-display text-2xl">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-paper/65">{item.text}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ───────────── How it works ───────────── */}
      <section id="how" className="scroll-mt-20 py-20 lg:py-28">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow={dict.nav.how} title={dict.how.title} />
            <ol className="mt-12 space-y-2">
              {dict.how.steps.map((s, i) => (
                <li key={s.title} className="reveal group relative grid grid-cols-[4.5rem_1fr] gap-4 pb-8">
                  {i < dict.how.steps.length - 1 && (
                    <span aria-hidden="true" className="absolute left-[2.2rem] top-16 h-[calc(100%-4.5rem)] border-l-2 border-dashed border-ink/15" />
                  )}
                  <span className="grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full border border-ink/15 bg-paper font-display text-3xl text-primary transition group-hover:bg-primary group-hover:text-paper">
                    {i + 1}
                  </span>
                  <div className="pt-3">
                    <h3 className="font-display text-2xl sm:text-3xl">{s.title}</h3>
                    <p className="mt-2 max-w-md leading-relaxed text-ink/70">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="relative mx-auto grid w-full max-w-xl grid-cols-[1.1fr_0.9fr] gap-4">
            <div className="arch reveal relative aspect-[3/4.2]">
              <Image src="/images/airport.webp" alt="Agadir Al Massira airport" fill sizes="(min-width:1024px) 300px, 50vw" className="object-cover" />
            </div>
            <div className="mt-16 space-y-4">
              <div className="arch reveal relative aspect-[3/4]">
                <Image src="/images/camel-beach.webp" alt="Camel on the beach near Taghazout" fill sizes="(min-width:1024px) 240px, 40vw" className="object-cover" />
              </div>
              <div className="reveal rounded-3xl bg-ocean p-5 text-paper">
                <p className="font-display text-4xl leading-none">60′</p>
                <p className="mt-2 text-sm text-paper/80">{dict.booking.price.included[1]}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Destinations ───────────── */}
      <section className="bg-sand-2/50 py-20 lg:py-28" aria-labelledby="dest-title">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-3xl">
              <p className="eyebrow">{ds.eyebrow}</p>
              <h2 id="dest-title" className="reveal mt-4 text-balance font-display text-4xl leading-[1.04] tracking-tight sm:text-5xl lg:text-[3.6rem]">
                {ds.title}
              </h2>
              <p className="mt-5 text-lg text-ink/70">{ds.subtitle}</p>
            </div>
            <Link href={`/${lang}/destinations`} className="btn btn-ghost">
              {ds.viewAll} <IconArrow className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((slug) => {
              const d = destinations.find((x) => x.slug === slug)!;
              return (
                <div key={slug} className="reveal">
                  <DestinationCard d={d} locale={lang} labels={{ from: ds.from, km: ds.km, ...dur }} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────── Map ───────────── */}
      <section id="map" className="scroll-mt-20 py-20 lg:py-28">
        <div className="container-x">
          <SectionHeading eyebrow={dict.map.eyebrow} title={dict.map.title} subtitle={dict.map.text} />
          <div className="mt-12">
            <CoastMap
              locale={lang}
              labels={{ airport: dict.map.airport, from: ds.from, book: ds.book, details: ds.details, km: ds.km, ...dur }}
            />
          </div>
        </div>
      </section>

      {/* ───────────── Fleet & luggage ───────────── */}
      <section id="fleet" className="scroll-mt-20 pb-20 lg:pb-28">
        <div className="container-x">
          <SectionHeading eyebrow={dict.fleet.eyebrow} title={dict.fleet.title} subtitle={dict.fleet.subtitle} />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {vehicleOrder.map((v) => (
              <article key={v} className="card reveal flex flex-col p-6">
                <div className="rounded-2xl bg-sand px-4 pb-2 pt-6">
                  <Vehicle id={v} />
                </div>
                <h3 className="mt-6 font-display text-3xl">{dict.fleet.vehicles[v].name}</h3>
                <p className="mt-1 text-sm text-muted">{vehicles[v].model}</p>
                <p className="mt-3 flex-1 text-ink/75">{dict.fleet.vehicles[v].text}</p>
                <div className="mt-5 flex gap-4 border-t border-ink/10 pt-4 text-sm font-semibold">
                  <span>{t(dict.fleet.seats, { n: vehicles[v].seats })}</span>
                  <span className="text-ink/30">/</span>
                  <span>{t(dict.fleet.bags, { n: vehicles[v].bags })}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="reveal relative mt-8 grid overflow-hidden rounded-[2rem] bg-foam lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 sm:p-12">
              <p className="eyebrow">{dict.luggage.eyebrow}</p>
              <h3 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">{dict.luggage.title}</h3>
              <p className="mt-4 max-w-lg text-ink/80">{dict.luggage.text}</p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {dict.luggage.rules.map((r) => (
                  <li key={r} className="flex items-start gap-3 text-[0.95rem] font-medium">
                    <IconCheck className="mt-0.5 h-5 w-5 shrink-0" />
                    {t(r, { extra: formatMoney(EXTRA_BAG_EUR, "EUR", lang), oversize: formatMoney(OVERSIZE_ITEM_EUR, "EUR", lang) })}
                  </li>
                ))}
              </ul>
            </div>
            <div aria-hidden="true" className="relative hidden items-end justify-center gap-3 overflow-hidden bg-[#c4e0e6] px-10 pt-16 lg:flex">
              {[
                ["h-56 w-36", "bg-saffron", "border-saffron"],
                ["h-72 w-44", "bg-ink", "border-ink"],
                ["h-48 w-32", "bg-primary", "border-primary"],
              ].map(([size, color, handle], i) => (
                <div key={i} className={`relative ${size} ${color} rounded-t-[1.4rem] shadow-2xl`}>
                  <span className={`absolute -top-6 left-1/2 h-7 w-14 -translate-x-1/2 rounded-t-xl border-[6px] border-b-0 ${handle}`} />
                  <span className="absolute inset-x-5 top-10 h-px bg-white/25" />
                  <span className="absolute inset-x-5 top-16 h-px bg-white/25" />
                  <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-display text-5xl text-white/90">{i === 1 ? "2×" : ""}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section id="faq" className="scroll-mt-20 bg-paper py-20 lg:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading eyebrow={dict.faq.eyebrow} title={dict.faq.title} />
            <a href={whatsappLink()} target="_blank" rel="noopener" className="btn btn-ghost mt-8">
              <IconWhatsapp className="h-4 w-4 text-[#25D366]" /> {dict.cta.whatsapp}
            </a>
          </div>
          <Faq items={dict.faq.items} />
        </div>
      </section>

      {/* ───────────── CTA ───────────── */}
      <section className="relative isolate overflow-hidden">
        <Image src="/images/agadir-bay.webp" alt="" fill sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/90 via-ink/55 to-ink/0" />
        <div className="container-x py-24 text-paper lg:py-36">
          <p className="font-tifinagh text-xl tracking-[0.4em] text-saffron" aria-hidden="true">ⴰⵣⵓⵍ</p>
          <h2 className="reveal mt-4 max-w-2xl font-display text-5xl leading-[0.98] sm:text-7xl">{dict.cta.title}</h2>
          <p className="mt-6 max-w-lg text-lg text-paper/80">{dict.cta.text}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={`/${lang}/book`} className="btn btn-primary">
              {dict.cta.button} <IconArrow className="h-4 w-4" />
            </Link>
            <a href={whatsappLink()} target="_blank" rel="noopener" className="btn btn-light">
              <IconWhatsapp className="h-4 w-4 text-[#25D366]" /> {dict.cta.whatsapp}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
