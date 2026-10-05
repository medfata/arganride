import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { site, whatsappLink } from "@/lib/site";
import { Logo } from "./Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { IconWhatsapp } from "./Icons";
import { MobileMenu } from "./MobileMenu";

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const links = [
    { href: `/${locale}/destinations`, label: dict.nav.destinations },
    { href: `/${locale}#how`, label: dict.nav.how },
    { href: `/${locale}#fleet`, label: dict.nav.fleet },
    { href: `/${locale}#faq`, label: dict.nav.faq },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-sand/80 backdrop-blur-xl supports-[backdrop-filter]:bg-sand/65">
      <div className="container-x flex h-[72px] items-center justify-between gap-4">
        <Link href={`/${locale}`} aria-label={`${site.name} — ${dict.nav.home}`} className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="rounded-full px-4 py-2 text-[0.95rem] font-medium text-ink/80 transition hover:bg-ink/5 hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener"
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-ocean hover:bg-ocean/10 md:inline-flex"
          >
            <IconWhatsapp className="h-4 w-4" /> {dict.common.whatsapp}
          </a>
          <LocaleSwitcher locale={locale} label={dict.nav.language} />
          <Link href={`/${locale}/book`} className="btn btn-primary hidden !py-3 !px-5 text-sm sm:inline-flex">
            {dict.nav.book}
          </Link>
          <MobileMenu
            links={links}
            labels={{ menu: dict.nav.menu, close: dict.nav.close, book: dict.nav.book }}
            bookHref={`/${locale}/book`}
            whatsappHref={whatsappLink()}
          />
        </div>
      </div>
    </header>
  );
}
