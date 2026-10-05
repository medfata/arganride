/**
 * Business configuration. Edit these values (or set the env vars) before going live.
 * Everything public-facing — header, footer, JSON-LD, llms.txt, WhatsApp links — reads from here.
 */
export const site = {
  name: "Aga Taxi",
  legalName: "Aga Taxi — Agadir Airport Transfers",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://aga-taxi.com").replace(/\/$/, ""),
  // International format, digits only for wa.me links.
  phone: process.env.NEXT_PUBLIC_PHONE ?? "+212 600 000 000",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "212600000000",
  email: process.env.NEXT_PUBLIC_EMAIL ?? "booking@aga-taxi.com",
  address: {
    street: "Aéroport Agadir Al Massira",
    city: "Agadir",
    region: "Souss-Massa",
    postalCode: "80000",
    country: "MA",
  },
  geo: { lat: 30.325, lng: -9.4131 },
  airport: { iata: "AGA", icao: "GMAD", name: "Agadir–Al Massira Airport" },
  foundingYear: 2016,
  social: [] as string[],
} as const;

export const whatsappLink = (text?: string) =>
  `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
