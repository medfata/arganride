import { destinations, type Destination } from "./destinations";
import type { Locale } from "./i18n/config";
import { vehicles } from "./pricing";
import { absUrl } from "./seo";
import { site } from "./site";

const BUSINESS_ID = `${site.url}/#business`;
const WEBSITE_ID = `${site.url}/#website`;

const areaServed = destinations.map((d) => ({ "@type": "Place", name: d.name.split(" & ")[0] }));

export function businessGraph(locale: Locale, description: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "TravelAgency"],
        "@id": BUSINESS_ID,
        name: site.name,
        legalName: site.legalName,
        description,
        url: absUrl(locale),
        logo: `${site.url}/icon.svg`,
        image: `${site.url}/images/hero-bay.webp`,
        telephone: site.phone,
        email: site.email,
        priceRange: "€€",
        currenciesAccepted: "EUR, MAD, GBP",
        paymentAccepted: "Cash, Credit Card",
        foundingDate: String(site.foundingYear),
        knowsLanguage: ["en", "fr", "de", "es", "ar"],
        address: {
          "@type": "PostalAddress",
          streetAddress: site.address.street,
          addressLocality: site.address.city,
          addressRegion: site.address.region,
          postalCode: site.address.postalCode,
          addressCountry: site.address.country,
        },
        geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          opens: "00:00",
          closes: "23:59",
        },
        areaServed,
        sameAs: site.social,
      },
      {
        "@type": "TaxiService",
        "@id": `${site.url}/#airport-transfer`,
        name: "Agadir Airport private transfers",
        serviceType: "Airport transfer",
        provider: { "@id": BUSINESS_ID },
        areaServed,
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Agadir Airport transfer prices",
          itemListElement: destinations.map((d) => offer(locale, d)),
        },
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: site.url,
        name: site.name,
        inLanguage: locale,
        publisher: { "@id": BUSINESS_ID },
      },
    ],
  };
}

function offer(locale: Locale, d: Destination) {
  return {
    "@type": "Offer",
    name: `Agadir Airport (AGA) → ${d.name}`,
    url: absUrl(locale, `/destinations/${d.slug}`),
    price: d.priceEur,
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    eligibleQuantity: { "@type": "QuantitativeValue", maxValue: vehicles.car.seats, unitText: "passengers" },
    itemOffered: {
      "@type": "TaxiService",
      name: `Private transfer Agadir Airport to ${d.name}`,
      provider: { "@id": BUSINESS_ID },
    },
  };
}

export function destinationGraph(locale: Locale, d: Destination, name: string, description: string, crumbs: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TaxiService",
        name,
        description,
        url: absUrl(locale, `/destinations/${d.slug}`),
        image: `${site.url}/images/${d.image}.webp`,
        provider: { "@id": BUSINESS_ID, "@type": "LocalBusiness", name: site.name, telephone: site.phone },
        areaServed: { "@type": "Place", name: d.name, geo: { "@type": "GeoCoordinates", latitude: d.lat, longitude: d.lng } },
        offers: (["car", "van", "minibus"] as const).map((v) => ({
          "@type": "Offer",
          name: `${v} — up to ${vehicles[v].seats} passengers`,
          price: Math.round(d.priceEur * vehicles[v].multiplier),
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
        })),
      },
      breadcrumbs(crumbs),
    ],
  };
}

export function breadcrumbs(items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
  };
}

export function faqGraph(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}
