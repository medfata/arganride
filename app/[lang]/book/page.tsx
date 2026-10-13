import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { absUrl, pageMetadata } from "@/lib/seo";
import { breadcrumbs } from "@/lib/structured-data";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { JsonLd } from "@/components/JsonLd";

export async function generateMetadata({ params }: PageProps<"/[lang]/book">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata({ locale: lang, path: "/book", title: dict.booking.metaTitle, description: dict.booking.metaDescription });
}

export default async function BookPage({ params }: PageProps<"/[lang]/book">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const ds = dict.destinationsSection;

  return (
    <div className="relative pb-28 lg:pb-24">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          ...breadcrumbs([
            { name: dict.nav.home, url: absUrl(lang) },
            { name: dict.booking.title, url: absUrl(lang, "/book") },
          ]),
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sand-2/70 to-transparent" />
      <div className="container-x relative pt-10 sm:pt-14">
        <header className="mb-10 max-w-2xl">
          <p className="eyebrow">AGA · Agadir–Al Massira</p>
          <h1 className="mt-4 font-display text-5xl leading-[1] tracking-tight sm:text-6xl">{dict.booking.title}</h1>
          <p className="mt-4 text-lg text-ink/70">{dict.booking.subtitle}</p>
        </header>
        <Suspense fallback={<div className="card h-[32rem] animate-pulse" />}>
          <BookingWizard
            locale={lang}
            labels={{
              booking: dict.booking,
              promo: dict.promo,
              vehicles: { car: dict.fleet.vehicles.car.name, van: dict.fleet.vehicles.van.name, minibus: dict.fleet.vehicles.minibus.name },
              regions: dict.regions,
              duration: { minutes: ds.minutes, hours: ds.hours, km: ds.km },
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
