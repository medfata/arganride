import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { destinations, getDestination } from "@/lib/destinations";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatDuration, t } from "@/lib/i18n/format";
import { EXTRA_BAG_EUR, OVERSIZE_ITEM_EUR, formatMoney, vehicleOrder, vehicles } from "@/lib/pricing";
import { pageMetadata } from "@/lib/seo";
import { whatsappLink } from "@/lib/site";
import { faqGraph } from "@/lib/structured-data";
import { QuickQuote } from "@/components/QuickQuote";
import { FlapBoard } from "@/components/FlapBoard";
import { HeroSlides, type HeroSlide } from "@/components/HeroSlides";
import { CoastMap } from "@/components/CoastMap";
import { DestinationCard } from "@/components/DestinationCard";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { SectionHeading } from "@/components/SectionHeading";
import { Vehicle } from "@/components/Vehicle";
import { LogoMark } from "@/components/Logo";
import { IconArrow, IconBag, IconBasket, IconBoard, IconCheck, IconChild, IconRadar, IconSign, IconSim, IconTag, IconWhatsapp } from "@/components/Icons";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata({ locale: lang, title: dict.meta.title, description: dict.meta.description, keywords: dict.meta.keywords });
}

const featured = ["agadir", "taghazout", "tamraght", "imsouane", "paradise-valley", "essaouira"];
const trustIcons = [IconSign, IconRadar, IconTag, IconBag, IconSim, IconBoard, IconChild, IconBasket];

/** Hero backgrounds, one per corner of the region, each tied to the destination it shows. */
const heroPhotos = [
  { src: "/images/hero-taghazout.webp", place: "Taghazout", dest: "taghazout", position: "object-[78%_center] lg:object-[62%_60%]" },
  { src: "/images/hero-bay.webp", place: "Agadir", dest: "agadir", position: "object-[62%_center] lg:object-[50%_62%]" },
  { src: "/images/taghazout-sunset.webp", place: "Taghazout", dest: "taghazout", position: "object-[88%_center] lg:object-[50%_100%]" },
  { src: "/images/legzira.webp", place: "Legzira · Sidi Ifni", dest: "sidi-ifni", position: "object-[55%_center] lg:object-[50%_30%]" },
  { src: "/images/paradise-valley.webp", place: "Paradise Valley", dest: "paradise-valley", position: "object-[45%_center] lg:object-[50%_65%]" },
  { src: "/images/tafraoute.webp", place: "Tafraoute", dest: "tafraoute", position: "object-[50%_center] lg:object-[50%_55%]" },
];

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const ds = dict.destinationsSection;
  const dur = { minutes: ds.minutes, hours: ds.hours };
  const heroSlides: HeroSlide[] = heroPhotos.map(({ dest, ...photo }) => {
    const d = getDestination(dest)!;
    return { ...photo, trip: `${formatDuration(d.minutes, dur)} · ${ds.from} ${formatMoney(d.priceEur, "EUR", lang)}` };
  });

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
      {/* A framed, full-bleed photograph that dissolves into the sand page on its left, where the
          type sits; the photographs open up to the right. */}
      <section aria-labelledby="hero-title" className="px-2 pt-1 sm:px-3 lg:px-4">
        <div className="relative isolate flex min-h-[calc(100svh-116px)] flex-col overflow-hidden rounded-[1.75rem] bg-sand lg:max-h-[60rem] lg:min-h-[44rem] lg:rounded-[2.25rem] lg:bg-ink">
          {/* Phones: the photos are a band under the copy. Desktop: they fill the frame. */}
          <HeroSlides slides={heroSlides} />
          {/* Sand wash on desktop, so the copy sits on the page colour and the photo opens up to the right. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 hidden bg-[linear-gradient(100deg,rgb(246_240_229/.92)_0%,rgb(246_240_229/.85)_34%,rgb(246_240_229/.5)_47%,transparent_60%)] lg:block"
          />
          <div
            aria-hidden="true"
            className="zellige absolute inset-0 -z-10 opacity-[0.1] [mask-image:linear-gradient(to_bottom,#000,transparent_45%)] lg:[mask-image:linear-gradient(100deg,#000_0%,transparent_38%)]"
          />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-ink/45 to-transparent" />

          <div className="container-x relative flex flex-col pb-6 pt-12 lg:flex-1 sm:pt-16 lg:justify-center lg:pb-32 lg:pt-12">
            <div className="max-w-[40rem] lg:max-w-[36rem]">
              <h1 id="hero-title" className="font-display text-[3.1rem] leading-[0.96] tracking-[-0.02em] text-ink sm:text-7xl lg:text-[4.4rem] xl:text-[5rem]">
                <span className="block overflow-hidden pb-[0.08em]">
                  <span className="block animate-line [animation-delay:.05s]">{dict.hero.title}</span>
                </span>
                <span className="block overflow-hidden pb-[0.2em]">
                  <em className="block animate-line not-italic text-primary [animation-delay:.17s]">{dict.hero.titleEm}</em>
                </span>
              </h1>
              <p className="mt-6 max-w-[34rem] animate-rise text-pretty text-lg leading-relaxed text-ink/75 [animation-delay:.32s] sm:text-xl">
                {dict.hero.subtitle}
              </p>
              <div className="mt-8 flex animate-rise flex-wrap gap-3 [animation-delay:.42s]">
                <Link href={`/${lang}/book`} className="btn btn-primary">
                  {dict.hero.ctaPrimary} <IconArrow className="h-4 w-4" />
                </Link>
                <Link href={`/${lang}/destinations`} className="btn btn-ghost bg-paper/40 backdrop-blur-sm">
                  {dict.hero.ctaSecondary}
                </Link>
              </div>
            </div>
          </div>

          <div aria-hidden="true" className="h-[19rem] shrink-0 sm:h-[24rem] lg:hidden" />


        </div>
      </section>

      {/* Booking bar straddles the hero frame and the dark band below. */}
      <div className="container-x relative z-20 -mt-12 -mb-24 animate-rise [animation-delay:.6s] lg:-mt-16 lg:-mb-14">
        <QuickQuote
          variant="bar"
          locale={lang}
          labels={{
            ...dict.quick,
            regular: dict.promo.regular,
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
              <Image src="/images/arrival.webp" alt="Traveller walking across the apron at Agadir–Al Massira airport" fill sizes="(min-width:1024px) 300px, 50vw" className="object-cover object-[70%_center]" />
            </div>
            <div className="mt-16 space-y-4">
              <div className="arch reveal relative aspect-[3/4]">
                <Image src="/images/agadir-promenade.webp" alt="Palm-lined beach promenade in Agadir" fill sizes="(min-width:1024px) 240px, 40vw" className="object-cover object-[40%_center]" />
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

      {/* ───────────── Brand story ───────────── */}
      <section aria-labelledby="story-title" className="relative overflow-hidden bg-sand-2/60 py-20 lg:py-24">
        <div className="container-x grid items-center gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="reveal relative mx-auto w-full max-w-[16rem] lg:max-w-xs">
            <LogoMark className="h-auto w-full drop-shadow-[0_30px_40px_rgba(138,90,50,.25)]" />
            <p aria-hidden="true" className="mt-4 text-center font-tifinagh text-2xl tracking-[0.4em] text-nut">ⴰⵔⴳⴰⵏ</p>
          </div>
          <div className="reveal">
            <p className="eyebrow !text-nut">{dict.story.eyebrow}</p>
            <h2 id="story-title" className="mt-4 max-w-2xl text-balance font-display text-4xl leading-[1.04] tracking-tight sm:text-5xl">
              {dict.story.title}
            </h2>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-ink/75">{dict.story.text}</p>
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
        <Image src="/images/hero-bay.webp" alt="" fill sizes="100vw" className="-z-10 object-cover object-[50%_40%]" />
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
