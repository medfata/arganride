"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { parseFlightNumber } from "@/lib/airlines";
import {
  emptyLeg,
  pickupBeforeFlight,
  todayISO,
  validateStep,
  type BookingDraft,
  type Direction,
  type FieldErrors,
  type FlightLeg,
} from "@/lib/booking";
import { destinations, getDestination, regionOrder } from "@/lib/destinations";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { formatDuration, t } from "@/lib/i18n/format";
import {
  EXTRA_BAG_EUR,
  FREE_BAGS_PER_PASSENGER,
  MAX_PASSENGERS,
  OVERSIZE_ITEM_EUR,
  currencies,
  formatMoney,
  quote,
  vehicleFits,
  vehicleOrder,
  vehicles,
  type Currency,
  type Quote,
} from "@/lib/pricing";
import { whatsappLink } from "@/lib/site";
import { Stepper } from "../Stepper";
import { Vehicle } from "../Vehicle";
import { IconArrow, IconBag, IconBoard, IconCheck, IconChild, IconPin, IconPlane, IconUsers, IconWhatsapp } from "../Icons";

type Labels = {
  booking: Dictionary["booking"];
  vehicles: Record<"car" | "van" | "minibus", string>;
  regions: Dictionary["regions"];
  duration: { minutes: string; hours: string; km: string };
};

const STORAGE_KEY = "aga-taxi-draft-v1";

const initialDraft = (): BookingDraft => ({
  direction: "arrival",
  outbound: { ...emptyLeg },
  inbound: { ...emptyLeg },
  destination: "",
  address: "",
  passengers: 2,
  childSeats: 0,
  bags: 4,
  oversize: 0,
  vehicle: null,
  name: "",
  email: "",
  phone: "",
  sign: "",
  notes: "",
});

type FlightInfo = { airline?: string; origin?: string; destination?: string; time?: string } | null;

export function BookingWizard({ locale, labels }: { locale: Locale; labels: Labels }) {
  const L = labels.booking;
  const search = useSearchParams();
  const [b, setB] = useState<BookingDraft>(initialDraft);
  const [bagsTouched, setBagsTouched] = useState(false);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [done, setDone] = useState<{ ref: string; totalEur: number } | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const today = useMemo(() => todayISO(), []);

  // Restore an unfinished booking, then apply any ?to=&pax=&bags= from the quick quote.
  // Browser storage is only readable after hydration, so this has to run in an effect.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let next = initialDraft();
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) next = { ...next, ...JSON.parse(saved) };
      const c = localStorage.getItem("aga-taxi-currency") as Currency | null;
      if (c && currencies.includes(c)) setCurrency(c);
    } catch {}
    const to = search.get("to");
    const pax = Number(search.get("pax"));
    const bags = search.get("bags");
    if (to && getDestination(to)) next.destination = to;
    if (pax >= 1 && pax <= MAX_PASSENGERS) next.passengers = pax;
    if (bags !== null && Number(bags) >= 0) {
      next.bags = Number(bags);
      setBagsTouched(next.bags !== next.passengers * FREE_BAGS_PER_PASSENGER);
    }
    setB(next);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated || done) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(b));
    } catch {}
  }, [b, hydrated, done]);

  useEffect(() => {
    try {
      localStorage.setItem("aga-taxi-currency", currency);
    } catch {}
  }, [currency]);

  const set = <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) => setB((prev) => ({ ...prev, [key]: value }));
  const setLeg = (which: "outbound" | "inbound", patch: Partial<FlightLeg>) =>
    setB((prev) => ({ ...prev, [which]: { ...prev[which], ...patch } }));

  const setPassengers = (n: number) =>
    setB((prev) => ({ ...prev, passengers: n, bags: bagsTouched ? prev.bags : n * FREE_BAGS_PER_PASSENGER, childSeats: Math.min(prev.childSeats, n) }));

  const dest = getDestination(b.destination);

  // Which clock time drives the night supplement for each leg.
  const pickupTimes = useMemo(() => {
    const drive = dest?.minutes ?? 45;
    const out = b.direction === "departure" && b.outbound.time ? pickupBeforeFlight(b.outbound.time, drive).time : b.outbound.time;
    const back = b.direction === "round" && b.inbound.time ? pickupBeforeFlight(b.inbound.time, drive).time : undefined;
    return { out, back };
  }, [b.direction, b.outbound.time, b.inbound.time, dest]);

  const q: Quote | null = useMemo(
    () =>
      quote({
        destination: b.destination,
        passengers: b.passengers,
        bags: b.bags,
        oversize: b.oversize,
        vehicle: b.vehicle ?? undefined,
        time: pickupTimes.out,
        returnTime: pickupTimes.back,
        roundTrip: b.direction === "round",
      }),
    [b, pickupTimes],
  );

  const steps = [L.steps.trip, L.steps.destination, L.steps.passengers, L.steps.details, L.steps.review];
  const err = (k: string) => (errors[k] ? L.errors[errors[k]!] : undefined);

  const go = (target: number) => {
    if (target > step) {
      for (let s = step; s < target; s++) {
        const e = validateStep(s, b, today);
        if (Object.keys(e).length) {
          setErrors(e);
          setStep(s);
          requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
          return;
        }
      }
    }
    setErrors({});
    setStep(target);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = async () => {
    setStatus("sending");
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...b, locale, currency }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { ref: string; totalEur: number };
      setDone(data);
      setStatus("idle");
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {}
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      setStatus("error");
    }
  };

  const money = (eur: number) => formatMoney(eur, currency, locale);

  if (done) return <Done locale={locale} L={L} done={done} b={b} money={money} />;

  return (
    <div ref={topRef} className="scroll-mt-24 grid gap-8 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_24rem]">
      <div className="min-w-0">
        {/* Progress */}
        <nav aria-label="Progress" className="mb-8">
          <ol className="flex items-center gap-1.5 sm:gap-2">
            {steps.map((s, i) => (
              <li key={s} className="flex min-w-0 flex-1 flex-col gap-2">
                <button
                  type="button"
                  onClick={() => i < step && go(i)}
                  disabled={i > step}
                  aria-current={i === step ? "step" : undefined}
                  className="group text-left disabled:cursor-default"
                >
                  <span className={`block h-1.5 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-ink/10"}`} />
                  <span className={`mt-2 hidden truncate text-xs font-semibold sm:block ${i === step ? "text-ink" : "text-ink/45"}`}>
                    {i + 1}. {s}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm font-semibold sm:hidden">
            {step + 1}/{steps.length} · {steps[step]}
          </p>
        </nav>

        <div className="card p-5 sm:p-8" key={step}>
          {step === 0 && (
            <StepFlight
              L={L}
              b={b}
              set={set}
              setLeg={setLeg}
              err={err}
              today={today}
              dest={dest}
              duration={labels.duration}
            />
          )}
          {step === 1 && <StepDestination L={L} b={b} set={set} err={err} regions={labels.regions} duration={labels.duration} locale={locale} />}
          {step === 2 && (
            <StepPassengers
              L={L}
              b={b}
              set={set}
              setPassengers={setPassengers}
              setBags={(n) => {
                setBagsTouched(true);
                set("bags", n);
              }}
              q={q}
              vehicleNames={labels.vehicles}
              money={money}
            />
          )}
          {step === 3 && <StepDetails L={L} b={b} set={set} err={err} />}
          {step === 4 && (
            <StepReview L={L} b={b} q={q} dest={dest} vehicleNames={labels.vehicles} pickupOut={pickupTimes.out} pickupBack={pickupTimes.back} goTo={go} locale={locale} />
          )}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-6">
            {step > 0 ? (
              <button type="button" onClick={() => go(step - 1)} className="btn btn-ghost">
                ← {L.nav.back}
              </button>
            ) : (
              <span />
            )}
            {step < 4 ? (
              <button type="button" onClick={() => go(step + 1)} className="btn btn-primary">
                {L.nav.next} <IconArrow className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" onClick={submit} disabled={status === "sending"} className="btn btn-primary disabled:opacity-60">
                {status === "sending" ? L.review.sending : L.review.confirm}
                {status !== "sending" && <IconCheck className="h-4 w-4" />}
              </button>
            )}
          </div>
          {status === "error" && (
            <p role="alert" className="mt-4 rounded-2xl bg-primary/10 p-4 text-sm text-primary-2">
              {L.review.error}{" "}
              <a className="font-semibold underline" href={whatsappLink(summaryText(b, dest?.name ?? "", q, money))} target="_blank" rel="noopener">
                WhatsApp →
              </a>
            </p>
          )}
        </div>
      </div>

      <PriceSummary L={L} q={q} destName={dest?.name} money={money} currency={currency} setCurrency={setCurrency} vehicleNames={labels.vehicles} />

      {/* Mobile sticky total */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper/95 px-4 py-3 pr-24 backdrop-blur lg:hidden">
        <p className="text-xs text-muted">{L.price.title}</p>
        <p className="font-display text-2xl leading-tight tabular-nums">{q ? money(q.totalEur) : "—"}</p>
      </div>
    </div>
  );
}

/* ───────────────────────── Steps ───────────────────────── */

type SetFn = <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) => void;
type ErrFn = (k: string) => string | undefined;

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} className="mt-1.5 text-sm font-medium text-primary">
      {msg}
    </p>
  );
}

function StepTitle({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="mb-7 flex items-start gap-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sand text-primary">{icon}</span>
      <div>
        <h2 className="font-display text-3xl leading-tight sm:text-4xl">{title}</h2>
        {sub && <p className="mt-1 text-ink/65">{sub}</p>}
      </div>
    </div>
  );
}

function StepFlight({
  L,
  b,
  set,
  setLeg,
  err,
  today,
  dest,
  duration,
}: {
  L: Labels["booking"];
  b: BookingDraft;
  set: SetFn;
  setLeg: (w: "outbound" | "inbound", p: Partial<FlightLeg>) => void;
  err: ErrFn;
  today: string;
  dest: ReturnType<typeof getDestination>;
  duration: Labels["duration"];
}) {
  const options: { id: Direction; label: string; hint?: string }[] = [
    { id: "arrival", label: L.direction.arrival },
    { id: "departure", label: L.direction.departure },
    { id: "round", label: L.direction.round, hint: L.direction.roundHint },
  ];
  return (
    <>
      <StepTitle icon={<IconPlane className="h-6 w-6" />} title={L.steps.trip} sub={L.flight.tracking} />
      <fieldset>
        <legend className="label">{L.direction.label}</legend>
        <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-sand p-1.5">
          {options.map((o) => (
            <label
              key={o.id}
              className={`relative cursor-pointer rounded-xl px-2 py-3 text-center text-sm font-semibold transition sm:text-base ${
                b.direction === o.id ? "bg-ink text-paper shadow" : "text-ink/70 hover:bg-white/60"
              }`}
            >
              <input type="radio" name="direction" value={o.id} checked={b.direction === o.id} onChange={() => set("direction", o.id)} className="sr-only" />
              {o.label}
              {o.hint && <span className="ml-1 rounded-full bg-saffron px-1.5 py-0.5 text-[0.65rem] font-bold text-ink">{o.hint}</span>}
            </label>
          ))}
        </div>
      </fieldset>

      <FlightFields which="outbound" mode={b.direction === "departure" ? "departure" : "arrival"} L={L} leg={b.outbound} setLeg={setLeg} err={err} today={today} dest={dest} duration={duration} />

      {b.direction === "round" && (
        <div className="mt-8 border-t border-dashed border-ink/15 pt-8">
          <h3 className="mb-1 font-display text-2xl">{L.flight.returnTitle}</h3>
          <FlightFields which="inbound" mode="departure" L={L} leg={b.inbound} setLeg={setLeg} err={err} today={b.outbound.date || today} dest={dest} duration={duration} />
        </div>
      )}
    </>
  );
}

function FlightFields({
  which,
  mode,
  L,
  leg,
  setLeg,
  err,
  today,
  dest,
}: {
  which: "outbound" | "inbound";
  mode: "arrival" | "departure";
  L: Labels["booking"];
  leg: FlightLeg;
  setLeg: (w: "outbound" | "inbound", p: Partial<FlightLeg>) => void;
  err: ErrFn;
  today: string;
  dest: ReturnType<typeof getDestination>;
  duration: Labels["duration"];
}) {
  const parsed = parseFlightNumber(leg.number);
  const [lookup, setLookup] = useState<"idle" | "loading" | "notfound">("idle");
  const [info, setInfo] = useState<FlightInfo>(null);
  const id = (k: string) => `${which}-${k}`;

  const check = async () => {
    if (!parsed || !leg.date) return;
    setLookup("loading");
    setInfo(null);
    try {
      const res = await fetch(`/api/flights?number=${parsed.code}${parsed.number}&date=${leg.date}&type=${mode}`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as NonNullable<FlightInfo>;
      setInfo(data);
      if (data.time) setLeg(which, { time: data.time });
      setLookup("idle");
    } catch {
      setLookup("notfound");
    }
  };

  const pickup = mode === "departure" && leg.time ? pickupBeforeFlight(leg.time, dest?.minutes ?? 45) : null;

  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor={id("number")} className="label">
          {mode === "arrival" ? L.flight.arrivalNumber : L.flight.departureNumber}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <input
              id={id("number")}
              className="field pr-36 font-mono text-lg uppercase tracking-wider"
              placeholder={L.flight.placeholder}
              value={leg.number}
              disabled={leg.unknown}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              onChange={(e) => {
                setLeg(which, { number: e.target.value.toUpperCase() });
                setInfo(null);
                setLookup("idle");
              }}
              onBlur={() => parsed && setLeg(which, { number: parsed.normalized })}
              aria-invalid={!!err(`${which}.number`)}
              aria-describedby={id("number-help")}
            />
            {parsed?.airline && !leg.unknown && (
              <span className="pointer-events-none absolute right-3 top-1/2 inline-flex max-w-[8.5rem] -translate-y-1/2 items-center gap-1.5 truncate rounded-full bg-sand px-2.5 py-1 text-xs font-bold">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: parsed.color }} />
                <span className="truncate">{parsed.airline}</span>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={check}
            disabled={!parsed || !leg.date || lookup === "loading" || leg.unknown}
            className="btn btn-ghost shrink-0 !py-3 disabled:opacity-40"
          >
            {lookup === "loading" ? L.flight.lookingUp : L.flight.lookup}
          </button>
        </div>
        <div id={id("number-help")}>
          <FieldError id={id("number-err")} msg={err(`${which}.number`)} />
          {!err(`${which}.number`) && leg.number && !leg.unknown && !parsed && <p className="mt-1.5 text-sm text-muted">{L.flight.invalid}</p>}
          {parsed && !parsed.airline && !leg.unknown && <p className="mt-1.5 text-sm text-muted">{L.flight.unknownAirline}</p>}
          {info && (
            <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-ocean/10 px-3 py-1.5 text-sm font-medium text-ocean">
              <IconCheck className="h-4 w-4" />
              {t(L.flight.found, { airline: info.airline ?? parsed?.airline ?? "", origin: (mode === "arrival" ? info.origin : info.destination) ?? "—", time: info.time ?? "—" })}
            </p>
          )}
          {lookup === "notfound" && <p className="mt-1.5 text-sm text-muted">{L.flight.notFound}</p>}
        </div>
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={!!leg.unknown}
            onChange={(e) => setLeg(which, { unknown: e.target.checked })}
            className="h-4 w-4 accent-primary"
          />
          {L.flight.noFlightYet}
        </label>
      </div>

      <div>
        <label htmlFor={id("date")} className="label">
          {mode === "arrival" ? L.flight.arrivalDate : L.flight.departureDate}
        </label>
        <input
          id={id("date")}
          type="date"
          className="field"
          min={today}
          value={leg.date}
          onChange={(e) => setLeg(which, { date: e.target.value })}
          aria-invalid={!!err(`${which}.date`)}
        />
        <FieldError id={id("date-err")} msg={err(`${which}.date`)} />
      </div>
      <div>
        <label htmlFor={id("time")} className="label">
          {mode === "arrival" ? L.flight.arrivalTime : L.flight.departureTime}
        </label>
        <input
          id={id("time")}
          type="time"
          className="field"
          value={leg.time}
          onChange={(e) => setLeg(which, { time: e.target.value })}
          aria-invalid={!!err(`${which}.time`)}
        />
        <FieldError id={id("time-err")} msg={err(`${which}.time`)} />
      </div>
      {pickup && (
        <p className="rounded-2xl bg-saffron/20 p-4 text-sm font-medium sm:col-span-2">
          {t(L.flight.pickupAt, {
            time: pickup.time,
            hours: `${Math.floor(pickup.leadMinutes / 60)}:${String(pickup.leadMinutes % 60).padStart(2, "0")}`,
          })}
        </p>
      )}
    </div>
  );
}

function StepDestination({
  L,
  b,
  set,
  err,
  regions,
  duration,
  locale,
}: {
  L: Labels["booking"];
  b: BookingDraft;
  set: SetFn;
  err: ErrFn;
  regions: Labels["regions"];
  duration: Labels["duration"];
  locale: Locale;
}) {
  const [query, setQuery] = useState("");
  const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const matches = useMemo(() => {
    const qn = norm(query.trim());
    if (!qn) return destinations.map((d) => ({ d, alias: undefined as string | undefined }));
    return destinations
      .map((d) => {
        if (norm(d.name).includes(qn)) return { d, alias: undefined };
        const alias = d.aliases.find((a) => norm(a).includes(qn));
        return alias ? { d, alias } : null;
      })
      .filter(Boolean) as { d: (typeof destinations)[number]; alias?: string }[];
  }, [query]);

  return (
    <>
      <StepTitle icon={<IconPin className="h-6 w-6" />} title={L.destination.label} />
      <label htmlFor="dest-search" className="label">
        {L.destination.search}
      </label>
      <input
        id="dest-search"
        type="search"
        className="field"
        placeholder={L.destination.placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-invalid={!!err("destination")}
        aria-controls="dest-list"
      />
      <FieldError id="dest-err" msg={err("destination")} />

      <div id="dest-list" role="radiogroup" aria-label={L.destination.label} className="mt-4 max-h-[26rem] space-y-5 overflow-y-auto overscroll-contain pr-1">
        {matches.length === 0 && <p className="rounded-2xl bg-sand p-4 text-sm">{L.destination.noResults}</p>}
        {regionOrder.map((r) => {
          const items = matches.filter((m) => m.d.region === r);
          if (!items.length) return null;
          return (
            <div key={r}>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">{regions[r]}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {items.map(({ d, alias }) => {
                  const active = b.destination === d.slug;
                  return (
                    <button
                      key={d.slug}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => set("destination", d.slug)}
                      className={`flex items-center gap-3 rounded-2xl border p-2 pr-3 text-left transition ${
                        active ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "border-ink/10 bg-white hover:border-ink/30"
                      }`}
                    >
                      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                        <Image src={`/images/${d.image}.webp`} alt="" fill sizes="56px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{d.name}</span>
                        <span className="block truncate text-xs text-muted">
                          {alias ? `${alias} · ` : ""}
                          {t(duration.km, { n: d.km })} · {formatDuration(d.minutes, duration)}
                        </span>
                      </span>
                      <span className="text-sm font-bold tabular-nums">{formatMoney(d.priceEur, "EUR", locale)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <label htmlFor="address" className="label">
          {b.direction === "arrival" ? L.destination.address : L.destination.pickupAddress}
        </label>
        <input
          id="address"
          className="field"
          placeholder={L.destination.addressPlaceholder}
          value={b.address}
          onChange={(e) => set("address", e.target.value)}
          autoComplete="street-address"
          aria-invalid={!!err("address")}
        />
        {err("address") ? <FieldError id="addr-err" msg={err("address")} /> : <p className="mt-1.5 text-sm text-muted">{L.destination.addressHint}</p>}
      </div>
    </>
  );
}

function CounterRow({
  icon,
  label,
  hint,
  value,
  onChange,
  min,
  max,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sand text-ocean">{icon}</span>
        <div className="min-w-0">
          <p className="font-semibold">{label}</p>
          {hint && <p className="text-sm text-muted">{hint}</p>}
        </div>
      </div>
      <Stepper value={value} onChange={onChange} min={min} max={max} label={label} />
    </div>
  );
}

function StepPassengers({
  L,
  b,
  set,
  setPassengers,
  setBags,
  q,
  vehicleNames,
  money,
}: {
  L: Labels["booking"];
  b: BookingDraft;
  set: SetFn;
  setPassengers: (n: number) => void;
  setBags: (n: number) => void;
  q: Quote | null;
  vehicleNames: Labels["vehicles"];
  money: (eur: number) => string;
}) {
  const free = b.passengers * FREE_BAGS_PER_PASSENGER;
  const extra = Math.max(0, b.bags - free);
  const chosen = q?.vehicle ?? "car";
  return (
    <>
      <StepTitle icon={<IconUsers className="h-6 w-6" />} title={L.steps.passengers} />
      <div className="divide-y divide-ink/10">
        <CounterRow icon={<IconUsers className="h-5 w-5" />} label={L.pax.passengers} hint={L.pax.passengersHint} value={b.passengers} onChange={setPassengers} min={1} max={MAX_PASSENGERS} />
        <CounterRow icon={<IconChild className="h-5 w-5" />} label={L.pax.childSeats} hint={L.pax.childSeatsHint} value={b.childSeats} onChange={(n) => set("childSeats", n)} min={0} max={Math.min(4, b.passengers)} />
        <div>
          <CounterRow icon={<IconBag className="h-5 w-5" />} label={L.pax.bags} hint={t(L.pax.bagsHint, { free })} value={b.bags} onChange={setBags} min={0} max={40} />
          {/* Visual allowance: filled = included, primary = paid extra */}
          <div className="-mt-1 mb-4 flex flex-wrap gap-1 pl-[3.25rem]" aria-hidden="true">
            {Array.from({ length: Math.max(b.bags, free) }, (_, i) => (
              <span
                key={i}
                className={`h-5 w-3.5 rounded-[3px] border ${
                  i < Math.min(b.bags, free) ? "border-ocean bg-ocean" : i < free ? "border-ocean/40 border-dashed" : "border-primary bg-primary"
                }`}
              />
            ))}
            {extra > 0 && <span className="ml-2 text-xs font-semibold text-primary">+{money(extra * EXTRA_BAG_EUR)}</span>}
          </div>
        </div>
        <CounterRow
          icon={<IconBoard className="h-5 w-5" />}
          label={L.pax.oversize}
          hint={t(L.pax.oversizeHint, { price: money(OVERSIZE_ITEM_EUR) })}
          value={b.oversize}
          onChange={(n) => set("oversize", n)}
          min={0}
          max={16}
        />
      </div>

      <fieldset className="mt-8">
        <legend className="label">{L.pax.vehicle}</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {vehicleOrder.map((v) => {
            const fits = vehicleFits(v, b.passengers, b.bags, b.oversize);
            const active = chosen === v;
            return (
              <label
                key={v}
                className={`relative flex cursor-pointer flex-col rounded-2xl border p-4 transition ${
                  !fits ? "cursor-not-allowed opacity-45" : active ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "border-ink/10 bg-white hover:border-ink/30"
                }`}
              >
                <input type="radio" name="vehicle" className="sr-only" disabled={!fits} checked={active} onChange={() => set("vehicle", v)} />
                {q?.recommended === v && (
                  <span className="absolute -top-2.5 left-4 rounded-full bg-ocean px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-white">{L.pax.recommended}</span>
                )}
                <Vehicle id={v} className="h-14 w-full" />
                <span className="mt-2 font-semibold">{vehicleNames[v]}</span>
                <span className="text-xs text-muted">
                  {vehicles[v].seats} <IconUsers className="inline h-3 w-3" /> · {vehicles[v].bags} <IconBag className="inline h-3 w-3" />
                </span>
                {!fits && <span className="mt-1 text-xs font-semibold text-primary">{L.pax.tooSmall}</span>}
              </label>
            );
          })}
        </div>
      </fieldset>
    </>
  );
}

function StepDetails({ L, b, set, err }: { L: Labels["booking"]; b: BookingDraft; set: SetFn; err: ErrFn }) {
  const field = (key: "name" | "email" | "phone" | "sign", label: string, props: React.InputHTMLAttributes<HTMLInputElement>, hint?: string) => (
    <div>
      <label htmlFor={key} className="label">
        {label}
      </label>
      <input id={key} className="field" value={b[key]} onChange={(e) => set(key, e.target.value)} aria-invalid={!!err(key)} {...props} />
      {err(key) ? <FieldError id={`${key}-err`} msg={err(key)} /> : hint && <p className="mt-1.5 text-sm text-muted">{hint}</p>}
    </div>
  );
  return (
    <>
      <StepTitle icon={<IconUsers className="h-6 w-6" />} title={L.steps.details} />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">{field("name", L.details.name, { autoComplete: "name" })}</div>
        {field("email", L.details.email, { type: "email", autoComplete: "email", inputMode: "email" })}
        {field("phone", L.details.phone, { type: "tel", autoComplete: "tel", inputMode: "tel", placeholder: "+44 …" }, L.details.phoneHint)}
        <div className="sm:col-span-2">{field("sign", L.details.sign, { placeholder: b.name || undefined }, L.details.signHint)}</div>
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="label">
            {L.details.notes}
          </label>
          <textarea id="notes" rows={3} className="field resize-y" placeholder={L.details.notesPlaceholder} value={b.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>
      </div>
    </>
  );
}

function StepReview({
  L,
  b,
  q,
  dest,
  vehicleNames,
  pickupOut,
  pickupBack,
  goTo,
  locale,
}: {
  L: Labels["booking"];
  b: BookingDraft;
  q: Quote | null;
  dest: ReturnType<typeof getDestination>;
  vehicleNames: Labels["vehicles"];
  pickupOut?: string;
  pickupBack?: string;
  goTo: (s: number) => void;
  locale: Locale;
}) {
  const fmtDate = (iso: string) =>
    iso ? new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(new Date(`${iso}T12:00`)) : "—";
  const airport = "AGA";
  const route = b.direction === "departure" ? `${dest?.name} → ${airport}` : b.direction === "round" ? `${airport} ⇄ ${dest?.name}` : `${airport} → ${dest?.name}`;
  const rows: [string, React.ReactNode, number][] = [
    [L.review.route, <>{route}<br /><span className="text-muted">{b.address}</span></>, 1],
    [L.review.flight, <>{b.outbound.unknown ? "—" : b.outbound.number} · {fmtDate(b.outbound.date)} · {b.outbound.time}{b.direction === "round" && <><br />{b.inbound.unknown ? "—" : b.inbound.number} · {fmtDate(b.inbound.date)} · {b.inbound.time}</>}</>, 0],
    [L.review.pickup, <>{pickupOut}{pickupBack && <> / {pickupBack}</>}</>, 0],
    [L.review.passengers, <>{b.passengers}{b.childSeats > 0 && <> · {t(L.review.childSeatsSummary, { n: b.childSeats })}</>}</>, 2],
    [L.review.luggage, t(L.review.bagsSummary, { bags: b.bags, oversize: b.oversize }), 2],
    [L.review.vehicle, q ? vehicleNames[q.vehicle] : "—", 2],
    [L.review.contact, <>{b.name}<br /><span className="text-muted">{b.email} · {b.phone}</span></>, 3],
  ];
  return (
    <>
      <StepTitle icon={<IconCheck className="h-6 w-6" />} title={L.review.title} />
      <dl className="divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white">
        {rows.map(([k, v, s]) => (
          <div key={k} className="grid grid-cols-[7.5rem_1fr_auto] items-start gap-3 px-4 py-3.5 text-sm sm:grid-cols-[9rem_1fr_auto]">
            <dt className="font-semibold text-ink/60">{k}</dt>
            <dd className="min-w-0 break-words">{v}</dd>
            <button type="button" onClick={() => goTo(s)} className="text-xs font-semibold text-ocean underline-offset-2 hover:underline" aria-label={`Edit ${k}`}>
              ✎
            </button>
          </div>
        ))}
      </dl>
      <ul className="mt-6 space-y-2 text-sm">
        <li className="flex gap-2"><IconCheck className="h-5 w-5 shrink-0 text-ocean" />{L.review.payNote}</li>
        <li className="flex gap-2"><IconCheck className="h-5 w-5 shrink-0 text-ocean" />{L.review.cancelNote}</li>
      </ul>
      <p className="mt-4 text-xs text-muted">{L.review.agree}</p>
    </>
  );
}

/* ───────────────────────── Summary & done ───────────────────────── */

function PriceSummary({
  L,
  q,
  destName,
  money,
  currency,
  setCurrency,
  vehicleNames,
}: {
  L: Labels["booking"];
  q: Quote | null;
  destName?: string;
  money: (eur: number) => string;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  vehicleNames: Labels["vehicles"];
}) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start" aria-label={L.price.title}>
      <div className="overflow-hidden rounded-[1.75rem] bg-ink text-paper shadow-[0_40px_80px_-40px_rgba(15,36,48,.8)]">
        <div className="zellige relative p-6">
          <div className="absolute inset-0 bg-ink/85" />
          <div className="relative flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-saffron">{L.price.title}</p>
            <label className="sr-only" htmlFor="currency">
              {L.price.currency}
            </label>
            <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-paper outline-none">
              {currencies.map((c) => (
                <option key={c} value={c} className="text-ink">
                  {c}
                </option>
              ))}
            </select>
          </div>
          <p className="relative mt-4 font-display text-6xl leading-none tabular-nums" aria-live="polite">
            {q ? money(q.totalEur) : "—"}
          </p>
          <p className="relative mt-2 text-sm text-paper/60">{L.price.perVehicle}</p>
        </div>
        <div className="p-6 pt-4">
          {q && destName ? (
            <ul className="space-y-2.5 text-sm">
              {q.lines.map((l) => (
                <li key={l.key} className="flex justify-between gap-4">
                  <span className="text-paper/75">{t(L.price.lines[l.key], { dest: destName, n: l.qty ?? 0, vehicle: vehicleNames[q.vehicle] })}</span>
                  <span className={`shrink-0 tabular-nums ${l.eur < 0 ? "text-emerald-300" : ""}`}>
                    {l.eur < 0 ? "−" : ""}
                    {money(Math.abs(l.eur))}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-paper/60">{L.price.empty}</p>
          )}
          <ul className="mt-5 space-y-2 border-t border-white/10 pt-5 text-sm text-paper/80">
            {L.price.included.map((i) => (
              <li key={i} className="flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-saffron" /> {i}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {currency !== "EUR" && q && <p className="mt-2 px-2 text-xs text-muted">≈ {formatMoney(q.totalEur, "EUR")} · indicative rate</p>}
    </aside>
  );
}

function summaryText(b: BookingDraft, destName: string, q: Quote | null, money: (eur: number) => string) {
  return [
    `Booking request — ${b.direction.toUpperCase()}`,
    `AGA ↔ ${destName} (${b.address})`,
    `Flight: ${b.outbound.number || "TBC"} ${b.outbound.date} ${b.outbound.time}`,
    b.direction === "round" ? `Return: ${b.inbound.number || "TBC"} ${b.inbound.date} ${b.inbound.time}` : "",
    `Passengers: ${b.passengers}, bags: ${b.bags}, sports: ${b.oversize}, child seats: ${b.childSeats}`,
    `Name: ${b.name} · ${b.phone}`,
    q ? `Price: ${money(q.totalEur)}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function Done({
  locale,
  L,
  done,
  b,
  money,
}: {
  locale: Locale;
  L: Labels["booking"];
  done: { ref: string; totalEur: number };
  b: BookingDraft;
  money: (eur: number) => string;
}) {
  return (
    <div className="card mx-auto max-w-2xl overflow-hidden text-center">
      <div className="zellige relative bg-ocean px-6 py-12 text-paper">
        <div className="absolute inset-0 bg-ocean/85" />
        <div className="relative">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-paper text-ocean">
            <IconCheck className="h-8 w-8" />
          </span>
          <h2 className="mt-6 font-display text-4xl leading-tight sm:text-5xl">{L.done.title}</h2>
        </div>
      </div>
      <div className="p-6 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">{L.done.ref}</p>
        <p className="mt-2 font-mono text-3xl font-bold tracking-widest">{done.ref}</p>
        <p className="mt-2 font-display text-2xl">{money(done.totalEur)}</p>
        <p className="mx-auto mt-5 max-w-md text-ink/75">{L.done.text}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a href={whatsappLink(t(L.whatsappMessage, { ref: done.ref }))} target="_blank" rel="noopener" className="btn bg-[#25D366] text-white hover:brightness-95">
            <IconWhatsapp className="h-5 w-5" /> {L.done.whatsapp}
          </a>
          <Link href={`/${locale}`} className="btn btn-ghost">
            {L.done.home}
          </Link>
        </div>
        <p className="mt-6 text-xs text-muted">{b.email}</p>
      </div>
    </div>
  );
}
