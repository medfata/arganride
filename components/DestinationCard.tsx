import Image from "next/image";
import Link from "next/link";
import type { Destination } from "@/lib/destinations";
import type { Locale } from "@/lib/i18n/config";
import { formatDuration, t } from "@/lib/i18n/format";
import { img } from "@/lib/images";
import { formatMoney } from "@/lib/pricing";
import { IconArrow } from "./Icons";

export function DestinationCard({
  d,
  locale,
  labels,
  priority,
}: {
  d: Destination;
  locale: Locale;
  labels: { from: string; minutes: string; hours: string; km: string };
  priority?: boolean;
}) {
  const image = img(d.image);
  return (
    <Link
      href={`/${locale}/destinations/${d.slug}`}
      className="group relative block rounded-[2rem] bg-paper p-2.5 ring-1 ring-ink/5 transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(23,37,28,.45)]"
    >
      <div className="arch relative aspect-[4/5]">
        <Image
          src={image.src}
          alt={d.name}
          fill
          sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 92vw"
          className="object-cover transition duration-700 group-hover:scale-105"
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-paper">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-saffron">
            {t(labels.km, { n: d.km })} · {formatDuration(d.minutes, labels)}
          </p>
          <h3 className="mt-1.5 font-display text-[1.9rem] leading-[1.05]">{d.name}</h3>
        </div>
      </div>
      <div className="flex items-center justify-between px-3 pb-1.5 pt-3.5">
        <p className="text-sm text-muted">
          {labels.from} <s className="text-muted/80">{formatMoney(d.listEur, "EUR", locale)}</s>{" "}
          <span className="font-display text-2xl text-ink">{formatMoney(d.priceEur, "EUR", locale)}</span>
        </p>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-paper transition group-hover:rotate-[-45deg] group-hover:bg-primary">
          <IconArrow className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
