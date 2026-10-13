import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { destinations } from "@/lib/destinations";
import { site, whatsappLink } from "@/lib/site";
import { Logo } from "./Logo";
import { IconMail, IconPhone, IconWhatsapp } from "./Icons";

const popular = ["agadir", "taghazout", "tamraght", "imsouane", "essaouira", "marrakech"];

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <div className="zellige pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 right-0 select-none font-tifinagh text-[22vw] leading-none text-white/[0.03]"
      >
        ⴰⵔⴳⴰⵏ
      </div>
      <div className="container-x relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr] lg:py-20">
        <div>
          <Logo tone="light" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-paper/70">{dict.footer.tagline}</p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-paper/80">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {dict.footer.available}
          </p>
        </div>

        <nav aria-label={dict.footer.explore}>
          <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-saffron">{dict.footer.explore}</h2>
          <ul className="mt-5 space-y-3 text-sm text-paper/80">
            <li><Link className="hover:text-white" href={`/${locale}/book`}>{dict.nav.book}</Link></li>
            <li><Link className="hover:text-white" href={`/${locale}/destinations`}>{dict.nav.destinations}</Link></li>
            <li><Link className="hover:text-white" href={`/${locale}#how`}>{dict.nav.how}</Link></li>
            <li><Link className="hover:text-white" href={`/${locale}#faq`}>{dict.nav.faq}</Link></li>
            <li><Link className="hover:text-white" href={`/${locale}/credits`}>{dict.footer.credits}</Link></li>
          </ul>
        </nav>

        <nav aria-label={dict.footer.popular}>
          <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-saffron">{dict.footer.popular}</h2>
          <ul className="mt-5 space-y-3 text-sm text-paper/80">
            {popular.map((slug) => {
              const d = destinations.find((x) => x.slug === slug)!;
              return (
                <li key={slug}>
                  <Link className="hover:text-white" href={`/${locale}/destinations/${slug}`}>
                    AGA → {d.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-saffron">{dict.footer.contact}</h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <a href={whatsappLink()} target="_blank" rel="noopener" className="inline-flex items-center gap-3 text-paper/80 hover:text-white">
                <IconWhatsapp className="h-4 w-4 text-saffron" /> {dict.common.whatsapp} · {site.phone}
              </a>
            </li>
            <li>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-3 text-paper/80 hover:text-white">
                <IconPhone className="h-4 w-4 text-saffron" /> {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="inline-flex items-center gap-3 text-paper/80 hover:text-white">
                <IconMail className="h-4 w-4 text-saffron" /> {site.email}
              </a>
            </li>
          </ul>
          <address className="mt-6 text-sm not-italic leading-relaxed text-paper/60">
            {site.airport.name} ({site.airport.iata})
            <br />
            {site.address.postalCode} {site.address.city}, Morocco
          </address>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalName}. {dict.footer.rights}
          </p>
          <p className="font-tifinagh tracking-widest text-paper/40" aria-hidden="true">
            ⴰⵣⵓⵍ · ⴰⴳⴰⴷⵉⵔ · ⵜⴰⵖⴰⵣⵓⵜ
          </p>
        </div>
      </div>
    </footer>
  );
}
