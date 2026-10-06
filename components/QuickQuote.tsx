"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { destinations, regionOrder } from "@/lib/destinations";
import type { Locale } from "@/lib/i18n/config";
import { FREE_BAGS_PER_PASSENGER, MAX_PASSENGERS, formatMoney, quote } from "@/lib/pricing";
import { IconArrow, IconPin, IconPlane, IconSwap } from "./Icons";
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
  swap: string;
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
  // false: airport → place (arrival). true: place → airport (departure). Price is the same either way.
  const [toAirport, setToAirport] = useState(false);
  const bagCount = bags ?? pax * FREE_BAGS_PER_PASSENGER;

  const q = useMemo(() => quote({ destination: to, passengers: pax, bags: bagCount, oversize: 0 }), [to, pax, bagCount]);
  const href = `/${locale}/book?to=${to}&pax=${pax}&bags=${bagCount}${toAirport ? "&dir=departure" : ""}`;
  const bar = variant === "bar";

  const segment = bar ? "lg:h-full lg:rounded-none lg:bg-transparent lg:px-5" : "";

  const airportField = (
    <div className={`flex items-center gap-3 rounded-2xl bg-sand/70 px-4 py-3 pr-16 ${segment}`}>
      <IconPlane className={`h-5 w-5 shrink-0 text-ocean ${bar ? "lg:hidden" : ""}`} />
      <div className="min-w-0">
        <p className={fieldLabel}>{toAirport ? labels.to : labels.from}</p>
        <p className="truncate font-semibold">
          {bar ? (
            <>
              <span className="lg:hidden">{labels.airport}</span>
              {/* The bar is tight on desktop; the IATA code lives in a chip instead of the name. */}
              <span className="hidden items-center gap-1.5 lg:inline-flex">
                {labels.airport.replace(/\s*\(AGA\)/, "")}
                <span className="rounded bg-ink px-1 py-px text-[0.6rem] font-bold tracking-wider text-paper">AGA</span>
              </span>
            </>
          ) : (
            labels.airport
          )}
        </p>
      </div>
    </div>
  );

  const placeField = (
    <label className={`flex items-center gap-3 rounded-2xl bg-sand/70 px-4 py-3 pr-16 focus-within:ring-2 focus-within:ring-ocean/40 ${segment}`}>
      <IconPin className={`h-5 w-5 shrink-0 text-primary ${bar ? "lg:hidden" : ""}`} />
      <span className="min-w-0 flex-1">
        <span className={fieldLabel}>{toAirport ? labels.from : labels.to}</span>
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

  // The two route fields with a swap button on their seam: stacked (⇅) on small screens and
  // in the card, side by side (⇄) in the desktop bar.
  const route = (
    <div className={`relative grid gap-2 ${bar ? "col-span-2 lg:col-span-1 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-ink/10 lg:[&>:first-child]:pr-8 lg:[&>:nth-child(2)]:pl-9" : ""}`}>
      {toAirport ? placeField : airportField}
      {toAirport ? airportField : placeField}
      <button
        type="button"
        onClick={() => setToAirport((v) => !v)}
        aria-label={labels.swap}
        aria-pressed={toAirport}
        title={labels.swap}
        className={`absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-ink/10 bg-paper text-primary shadow-[0_6px_16px_-6px_rgba(11,34,51,.45)] transition hover:bg-primary hover:text-white active:scale-95 ${
          bar ? "lg:left-1/2 lg:right-auto lg:-translate-x-1/2" : ""
        }`}
      >
        <span className={bar ? "lg:rotate-90" : ""}>
          <IconSwap className={`block h-4 w-4 transition-transform duration-300 ${toAirport ? "rotate-180" : ""}`} />
        </span>
      </button>
    </div>
  );

  const counter = (label: string, value: number, onChange: (n: number) => void, min: number, max: number) => (
    <div className={`rounded-2xl border border-ink/10 px-3 py-2.5 ${bar ? "lg:flex lg:h-full lg:flex-col lg:justify-center lg:rounded-none lg:border-0 lg:px-4" : ""}`}>
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
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:items-stretch lg:gap-0 lg:divide-x lg:divide-ink/10 lg:rounded-2xl lg:bg-sand/60">
          {route}
          {counter(labels.passengers, pax, setPax, 1, MAX_PASSENGERS)}
          {counter(labels.bags, bagCount, setBags, 0, 40)}
          <div className="flex flex-wrap items-end justify-between gap-3 col-span-2 border-t border-dashed border-ink/15 pt-4 lg:col-span-1 lg:flex-nowrap lg:items-center lg:gap-4 lg:border-0 lg:bg-paper lg:py-2 lg:pl-5 lg:pr-2">
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
      <div className="mt-4">{route}</div>
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
