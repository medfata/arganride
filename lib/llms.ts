import { LAUNCH_DISCOUNT, destinations } from "./destinations";
import { locales, localeMeta } from "./i18n/config";
import en from "./i18n/dictionaries/en";
import {
  EXTRA_BAG_EUR,
  FREE_BAGS_PER_PASSENGER,
  NIGHT_SURCHARGE,
  OVERSIZE_ITEM_EUR,
  ROUND_TRIP_DISCOUNT,
  simPackOrder,
  simPacks,
  vehicleOrder,
  vehicles,
} from "./pricing";
import { absUrl } from "./seo";
import { site } from "./site";

const hm = (m: number) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${String(m % 60).padStart(2, "0")}` : ""}`);

/** Markdown summary for LLMs, following the llms.txt proposal (https://llmstxt.org). */
export function llmsTxt(full: boolean) {
  const sorted = [...destinations].sort((a, b) => a.km - b.km);
  const lines: string[] = [
    `# ${site.name} — Agadir Airport Taxi & Private Transfers`,
    "",
    `> ${site.name} is a private airport transfer service based at ${site.airport.name} (IATA: ${site.airport.iata}, ICAO: ${site.airport.icao}) in Agadir, Morocco. Drivers meet travellers in the arrivals hall with a name sign and drive them door to door to hotels, riads, surf camps and villas in Agadir, Taghazout, Tamraght, Imsouane, Essaouira, Marrakech and the whole Souss-Massa region. Prices are fixed per vehicle (not per person), flights are tracked live, and every passenger gets ${FREE_BAGS_PER_PASSENGER} checked suitcases free.`,
    "",
    "## About the brand",
    "",
    `- Name: ${site.name} (also written ${site.alternateName.slice(0, 2).join(", ")}). Website: ${site.url}.`,
    `- Founded in ${site.foundingCity}, Morocco, in ${site.foundingYear}. Agadir is the first city served; more Moroccan airports will follow.`,
    `- Why "Argan": the argan tree grows almost only in the Souss region around Agadir. The brand is named after it to say where it comes from. Slogan: "${site.slogan}"`,
    `- Transfers are driven by licensed, insured Moroccan tourist-transport drivers who know the Souss coast.`,
    `- Best for: travellers landing at Agadir airport who want a fixed price agreed before they fly, surfers heading to Taghazout, Tamraght or Imsouane, families needing child seats, and groups needing a van or minibus.`,
    "",
    "## Key facts",
    "",
    `- Service: private taxi / chauffeur transfers from and to Agadir–Al Massira Airport (AGA), 24/7, every day of the year.`,
    `- Booking: online at ${absUrl("en", "/book")} (about 2 minutes), or by WhatsApp ${site.phone}. No prepayment; pay the driver in cash (EUR, MAD, GBP) or by card.`,
    `- Cancellation: free up to 24 hours before pickup.`,
    `- Meet & greet: the driver waits in the arrivals hall holding a sign with the client's name. 60 minutes of free waiting after actual landing; airline delays are never charged.`,
    `- Luggage: ${FREE_BAGS_PER_PASSENGER} checked suitcases free per passenger plus hand luggage. Extra suitcase €${EXTRA_BAG_EUR}. Surfboard, golf or bike bag €${OVERSIZE_ITEM_EUR}, free to surf towns (${destinations.filter((d) => d.surf).map((d) => d.name).join(", ")}). Child seats free.`,
    `- Free extras: a Moroccan SIM card for every arriving traveller (optional data packs: ${simPackOrder.filter((p) => simPacks[p]).map((p) => `${p.toUpperCase()} €${simPacks[p]}`).join(", ")} per SIM), cold water on board, and a free stop at a cash machine or supermarket. The driver's name and WhatsApp are sent before landing.`,
    `- Launch offer: all fares ${LAUNCH_DISCOUNT * 100}% off the regular price.`,
    `- Vehicles: ${vehicleOrder.map((v) => `${v} (up to ${vehicles[v].seats} passengers, ${vehicles[v].bags} suitcases)`).join("; ")}.`,
    `- Supplements: night transfers 23:00–06:00 +${NIGHT_SURCHARGE * 100}%. Round trips −${ROUND_TRIP_DISCOUNT * 100}%.`,
    `- Languages: English, French, German, Spanish, Arabic and Tamazight.`,
    `- Contact: WhatsApp/phone ${site.phone}, email ${site.email}.`,
    "",
    "## Fixed prices from Agadir Airport (one way, per vehicle, EUR)",
    "",
    "| Destination | Distance | Drive time | Car (1–3) | Van (4–7) | Minibus (8–16) |",
    "|---|---|---|---|---|---|",
    ...sorted.map(
      (d) =>
        `| [${d.name}](${absUrl("en", `/destinations/${d.slug}`)}) | ${d.km} km | ${hm(d.minutes)} | €${d.priceEur} | €${Math.round(d.priceEur * vehicles.van.multiplier)} | €${Math.round(d.priceEur * vehicles.minibus.multiplier)} |`,
    ),
    "",
    "## Pages",
    "",
    `- [Home](${absUrl("en")}): overview, instant price calculator, FAQ`,
    `- [Book a transfer](${absUrl("en", "/book")}): flight number, destination, passengers & luggage, fixed price`,
    `- [Destinations & prices](${absUrl("en", "/destinations")}): full price list`,
    ...locales.filter((l) => l !== "en").map((l) => `- [${localeMeta[l].label} version](${absUrl(l)})`),
  ];

  if (full) {
    lines.push("", "## Destinations", "");
    for (const d of sorted) {
      lines.push(
        `### Agadir Airport → ${d.name}`,
        "",
        `${d.blurb.en} Distance ${d.km} km, about ${hm(d.minutes)}. From €${d.priceEur} per car. Also known as / nearby: ${d.aliases.join(", ")}.`,
        `More: ${absUrl("en", `/destinations/${d.slug}`)}`,
        "",
      );
    }
    lines.push("## Frequently asked questions", "");
    for (const f of en.faq.items) lines.push(`### ${f.q}`, "", f.a, "");
  } else {
    lines.push("", "## Optional", "", `- [Full details for LLMs](${site.url}/llms-full.txt): every destination and the complete FAQ`);
  }
  return lines.join("\n");
}
