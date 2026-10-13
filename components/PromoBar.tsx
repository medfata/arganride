import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { launchPercent } from "@/lib/pricing";
import { IconArrow, IconTag } from "./Icons";

/** Launch offer strip above the header, on every page. */
export function PromoBar({ locale, promo }: { locale: Locale; promo: Dictionary["promo"] }) {
  const [before, after = ""] = promo.banner.split("{pct}");
  return (
    <div className="bg-ink text-paper">
      <div className="container-x flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 text-center text-sm">
        <p className="inline-flex items-center gap-2 font-semibold">
          <IconTag className="h-4 w-4 shrink-0 text-saffron" />
          <span>
            {before}
            <span className="rounded-full bg-saffron px-1.5 py-0.5 font-bold text-ink">{launchPercent(locale)}</span>
            {after}
            <span className="hidden font-normal text-paper/65 md:inline"> · {promo.note}</span>
          </span>
        </p>
        <Link href={`/${locale}/book`} className="inline-flex items-center gap-1 font-semibold text-saffron underline-offset-4 hover:underline">
          {promo.cta} <IconArrow className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
