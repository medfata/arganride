"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { destinations, regionOrder } from "@/lib/destinations";
import type { Locale } from "@/lib/i18n/config";
import { FREE_BAGS_PER_PASSENGER, MAX_PASSENGERS, formatMoney, quote } from "@/lib/pricing";
import { IconArrow, IconPin, IconPlane } from "./Icons";
import { Stepper } from "./Stepper";

type Labels = {
  title: string;
  from: string;
  airport: string;
  to: string;
  choose: string;
  passengers: string;
  bags: string;
  total: string;
  cta: string;
  note: string;
  vehicles: Record<"car" | "van" | "minibus", string>;
  regions: Record<string, string>;
};

export function QuickQuote({ locale, labels, initial = "taghazout" }: { locale: Locale; labels: Labels; initial?: string }) {
  const [to, setTo] = useState(initial);
  const [pax, setPax] = useState(2);
  const [bags, setBags] = useState<number | null>(null);
  const bagCount = bags ?? pax * FREE_BAGS_PER_PASSENGER;

  const q = useMemo(() => quote({ destination: to, passengers: pax, bags: bagCount, oversize: 0 }), [to, pax, bagCount]);
  const href = `/${locale}/book?to=${to}&pax=${pax}&bags=${bagCount}`;

  return (
    <div className="card relative p-5 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">{labels.title}</p>

      <div className="relative mt-4 space-y-2">
        <div className="flex items-center gap-3 rounded-2xl bg-sand/70 px-4 py-3">
          <IconPlane className="h-5 w-5 shrink-0 text-ocean" />
          <div className="min-w-0">
            <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted">{labels.from}</p>
            <p className="truncate font-semibold">{labels.airport}</p>
          </div>
        </div>
        <label className="flex items-center gap-3 rounded-2xl bg-sand/70 px-4 py-3 focus-within:ring-2 focus-within:ring-ocean/40">
          <IconPin className="h-5 w-5 shrink-0 text-terracotta" />
          <span className="min-w-0 flex-1">
            <span className="block text-[0.7rem] font-semibold uppercase tracking-wider text-muted">{labels.to}</span>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              aria-label={labels.choose}
              className="-ml-1 w-full cursor-pointer truncate bg-transparent font-semibold outline-none"
            >
              {regionOrder.map((r) => (
                <optgroup key={r} label={labels.regions[r]}>
                  {destinations
                    .filter((d) => d.region === r)
                    .map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {d.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </span>
        </label>
        <span aria-hidden="true" className="absolute left-[1.6rem] top-[3.6rem] h-4 border-l-2 border-dotted border-ink/25" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-ink/10 px-3 py-2.5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted">{labels.passengers}</p>
          <Stepper value={pax} min={1} max={MAX_PASSENGERS} onChange={setPax} label={labels.passengers} />
        </div>
        <div className="rounded-2xl border border-ink/10 px-3 py-2.5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted">{labels.bags}</p>
          <Stepper value={bagCount} min={0} max={40} onChange={setBags} label={labels.bags} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-dashed border-ink/15 pt-4">
        <div>
          <p className="text-xs text-muted">
            {labels.total} · {q && labels.vehicles[q.vehicle]}
          </p>
          <p className="font-display text-4xl leading-none tracking-tight tabular-nums" aria-live="polite">
            {q ? formatMoney(q.totalEur, "EUR", locale) : "—"}
          </p>
          <p className="mt-1 text-xs text-muted">≈ {q ? formatMoney(q.totalEur, "MAD", locale) : ""}</p>
        </div>
        <Link href={href} className="btn btn-primary shrink-0">
          {labels.cta} <IconArrow className="h-4 w-4" />
        </Link>
      </div>
      <p className="mt-3 text-center text-xs text-muted">{labels.note}</p>
    </div>
  );
}
