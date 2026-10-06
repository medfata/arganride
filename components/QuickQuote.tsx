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

const fieldLabel = "block text-[0.7rem] font-semibold uppercase tracking-wider text-muted";

export function QuickQuote({
  locale,
  labels,
  initial = "taghazout",
  variant = "card",
}: {
  locale: Locale;
  labels: Labels;
  initial?: string;
  /** "card" stacks vertically (sidebars); "bar" is the horizontal hero booking bar on large screens. */
  variant?: "card" | "bar";
}) {
  const [to, setTo] = useState(initial);
  const [pax, setPax] = useState(2);
  const [bags, setBags] = useState<number | null>(null);
  const bagCount = bags ?? pax * FREE_BAGS_PER_PASSENGER;

  const q = useMemo(() => quote({ destination: to, passengers: pax, bags: bagCount, oversize: 0 }), [to, pax, bagCount]);
  const href = `/${locale}/book?to=${to}&pax=${pax}&bags=${bagCount}`;
  const bar = variant === "bar";

  const from = (
    <div className={`flex items-center gap-3 rounded-2xl bg-sand/70 px-4 py-3 ${bar ? "col-span-2 lg:col-span-1 lg:h-full lg:rounded-none lg:bg-transparent lg:px-5" : ""}`}>
      <IconPlane className="h-5 w-5 shrink-0 text-ocean" />
      <div className="min-w-0">
        <p className={fieldLabel}>{labels.from}</p>
        <p className="truncate font-semibold">{labels.airport}</p>
      </div>
    </div>
  );

  const destination = (
    <label className={`flex items-center gap-3 rounded-2xl bg-sand/70 px-4 py-3 focus-within:ring-2 focus-within:ring-ocean/40 ${bar ? "col-span-2 lg:col-span-1 lg:h-full lg:rounded-none lg:bg-transparent lg:px-5" : ""}`}>
      <IconPin className="h-5 w-5 shrink-0 text-primary" />
      <span className="min-w-0 flex-1">
        <span className={fieldLabel}>{labels.to}</span>
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
  );

  const counter = (label: string, value: number, onChange: (n: number) => void, min: number, max: number) => (
    <div className={`rounded-2xl border border-ink/10 px-3 py-2.5 ${bar ? "lg:flex lg:h-full lg:flex-col lg:justify-center lg:rounded-none lg:border-0 lg:px-5" : ""}`}>
      <p className={fieldLabel}>{label}</p>
      <Stepper value={value} min={min} max={max} onChange={onChange} label={label} />
    </div>
  );

  const total = (
    <div>
      <p className="text-xs text-muted">
        {labels.total} · {q && labels.vehicles[q.vehicle]}
      </p>
      <p className="font-display text-4xl leading-none tracking-tight tabular-nums" aria-live="polite">
        {q ? formatMoney(q.totalEur, "EUR", locale) : "—"}
      </p>
      <p className="mt-1 text-xs text-muted">≈ {q ? formatMoney(q.totalEur, "MAD", locale) : ""}</p>
    </div>
  );

  const cta = (
    <Link href={href} className="btn btn-primary shrink-0">
      {labels.cta} <IconArrow className="h-4 w-4" />
    </Link>
  );

  if (bar) {
    return (
      <div className="card relative p-4 sm:p-5 lg:p-3">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary lg:hidden">{labels.title}</p>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-[1fr_1.25fr_auto_auto_auto] lg:items-stretch lg:gap-0 lg:divide-x lg:divide-ink/10 lg:rounded-2xl lg:bg-sand/60">
          {from}
          {destination}
          {counter(labels.passengers, pax, setPax, 1, MAX_PASSENGERS)}
          {counter(labels.bags, bagCount, setBags, 0, 40)}
          <div className="flex flex-wrap items-end justify-between gap-3 col-span-2 border-t border-dashed border-ink/15 pt-4 lg:col-span-1 lg:flex-nowrap lg:items-center lg:gap-5 lg:border-0 lg:bg-paper lg:py-2 lg:pl-6 lg:pr-2">
            {total}
            {cta}
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-muted lg:mt-2 lg:text-left lg:pl-3">
          <span className="hidden font-bold uppercase tracking-[0.18em] text-primary lg:inline">{labels.title} · </span>
          {labels.note}
        </p>
      </div>
    );
  }

  return (
    <div className="card relative p-5 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{labels.title}</p>
      <div className="relative mt-4 space-y-2">
        {from}
        {destination}
        <span aria-hidden="true" className="absolute left-[1.6rem] top-[3.6rem] h-4 border-l-2 border-dotted border-ink/25" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {counter(labels.passengers, pax, setPax, 1, MAX_PASSENGERS)}
        {counter(labels.bags, bagCount, setBags, 0, 40)}
      </div>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-dashed border-ink/15 pt-4">
        {total}
        {cta}
      </div>
      <p className="mt-3 text-center text-xs text-muted">{labels.note}</p>
    </div>
  );
}
