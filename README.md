# Aga Taxi — Agadir Airport Transfers

Private taxi transfers from **Agadir–Al Massira Airport (AGA)** to Agadir, Taghazout, Tamraght, Imsouane, Essaouira, Marrakech and the whole Souss-Massa region.

Built with Next.js 16 (App Router, Turbopack), React 19 and Tailwind CSS 4. Every page is statically generated in four languages.

## Features

- **Booking wizard** (`/[lang]/book`) in five steps:
  1. **Flight**: from the airport, to the airport, or round trip (−10%). The airline is recognised from the flight number, and an optional live lookup fills in the time. For trips to the airport, the pickup time is worked out for you.
  2. **Destination**: 17 zones you can search by town, neighbourhood, surf spot or hotel area, plus the exact address.
  3. **Passengers & luggage**: **2 free suitcases per passenger**. Extra bags and surf/golf/bike bags are priced separately. The smallest vehicle that fits is picked for you, and vehicles that are too small are disabled.
  4. **Contact details**
  5. **Review & confirm**: you get a booking reference, and the booking can also be confirmed on WhatsApp.
- **Live fixed price**: one pricing engine in `lib/pricing.ts` is used by both the UI and the API, so the price you're quoted is the price that's stored. You can view prices in EUR, MAD, GBP or USD.
- **4 languages** (EN, FR, DE, ES) with `/en`, `/fr`… routes. Visitors are sent to their language based on `Accept-Language`.
- **Destination landing pages** (17 × 4 languages), each with prices per vehicle, an FAQ and structured data.
- **Interactive coast map**, a **split-flap arrivals board**, and design touches from Agadir: horseshoe arches, zellige patterns, Tifinagh lettering, sunset colours.

## SEO & AI discoverability

- Metadata on every page: canonical URL, `hreflang` alternates + `x-default`, Open Graph and Twitter tags.
- JSON-LD: `LocalBusiness`/`TravelAgency`, `TaxiService` with an `OfferCatalog` of every route price, `FAQPage`, `BreadcrumbList` and `ItemList`.
- A generated **Open Graph image** for each language and destination, using real photos.
- `sitemap.xml` with language alternates, plus `robots.txt` that explicitly allows search and AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…).
- **`/llms.txt` and `/llms-full.txt`**: markdown summaries (facts, full price table, FAQ) so ChatGPT, Claude, Perplexity and others can quote accurate prices.
- Static HTML, optimised AVIF/WebP images, self-hosted fonts and minimal client JS.

## Before going live

1. Copy `.env.example` → `.env.local` (or set the variables on your host) and fill in **the real phone, WhatsApp and email**. The placeholders (`+212 600 000 000`) show up on the site and in the structured data.
2. Set `NEXT_PUBLIC_SITE_URL` to the production domain.
3. Turn on at least one booking channel: Resend email, Telegram bot or a webhook. If none is set, bookings are only written to the server log.
4. Check the prices and destinations in `lib/destinations.ts` and the rules in `lib/pricing.ts` (extra bag €2, sports bag €5, night +15%, round trip −10%, vehicle multipliers).
5. After deploying, submit `https://your-domain/sitemap.xml` to Google Search Console and Bing Webmaster Tools, and create a **Google Business Profile** at the airport address. For local "taxi near me" searches, that profile matters as much as the site does.

## Development

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build && pnpm start
pnpm lint
```

## Structure

```
app/[lang]/            pages (home, book, destinations, destinations/[slug], credits)
app/api/booking        validates, re-prices, notifies (email / Telegram / webhook)
app/api/flights        optional AeroDataBox flight lookup
app/llms.txt           AI-readable summaries
lib/i18n/dictionaries  all copy, one file per language
lib/destinations.ts    zones, distances, prices, localised blurbs
lib/pricing.ts         pricing engine shared by client and server
proxy.ts               locale negotiation (Next 16 "proxy", formerly middleware)
```

## Photo credits

Photos come from Wikimedia Commons and are used under CC0 / CC BY / CC BY-SA licences. Authors and licences are listed in `lib/image-credits.json` and on `/[lang]/credits`, and each destination hero shows its own credit.
