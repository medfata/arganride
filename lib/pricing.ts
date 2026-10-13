import { LAUNCH_DISCOUNT, getDestination } from "./destinations";

/** Shared by the booking UI and the booking API, so the quoted price is the price we store. */

export const FREE_BAGS_PER_PASSENGER = 2;
export const EXTRA_BAG_EUR = 2;
export const OVERSIZE_ITEM_EUR = 5; // surfboard bag, golf bag, bike box; free to surf towns
export const NIGHT_SURCHARGE = 0.15; // 23:00 – 06:00
export const ROUND_TRIP_DISCOUNT = 0.1;
export const MAX_PASSENGERS = 16;

/**
 * Every arriving traveller can ask for a free Moroccan SIM card, handed over by the driver.
 * Data is optional and charged at cost per card, paid to the driver with the fare.
 */
export const simPacks = { none: 0, "10gb": 5, "25gb": 10 } as const;
export type SimPack = keyof typeof simPacks;
export const simPackOrder = Object.keys(simPacks) as SimPack[];

export type VehicleId = "car" | "van" | "minibus";

export const vehicles: Record<
  VehicleId,
  { seats: number; bags: number; multiplier: number; image: string; model: string }
> = {
  car: { seats: 3, bags: 4, multiplier: 1, image: "car", model: "Dacia / Skoda / Toyota" },
  van: { seats: 7, bags: 10, multiplier: 1.45, image: "van", model: "Mercedes Vito / Renault Trafic" },
  minibus: { seats: 16, bags: 20, multiplier: 2.3, image: "minibus", model: "Mercedes Sprinter" },
};

export const vehicleOrder: VehicleId[] = ["car", "van", "minibus"];

export type Currency = "EUR" | "MAD" | "GBP" | "USD";
/** Indicative rates used for display only. Bookings are stored in EUR. */
export const currencyRates: Record<Currency, number> = { EUR: 1, MAD: 10.8, GBP: 0.85, USD: 1.08 };
export const currencies: Currency[] = ["EUR", "MAD", "GBP", "USD"];

export function formatMoney(eur: number, currency: Currency, locale = "en") {
  const value = eur * currencyRates[currency];
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "MAD" ? 0 : value % 1 === 0 ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(currency === "MAD" ? Math.round(value / 5) * 5 : value);
}

export type QuoteInput = {
  destination: string;
  passengers: number;
  bags: number;
  oversize: number;
  vehicle?: VehicleId;
  /** "HH:MM" local pickup time, used for the night surcharge. */
  time?: string;
  returnTime?: string;
  roundTrip?: boolean;
  simCards?: number;
  simPack?: SimPack;
};

export type QuoteLine = { key: "base" | "vehicle" | "bags" | "oversize" | "night" | "return" | "discount" | "sim"; eur: number; qty?: number };

export type Quote = {
  vehicle: VehicleId;
  recommended: VehicleId;
  freeBags: number;
  extraBags: number;
  lines: QuoteLine[];
  totalEur: number;
};

/** Oversized items take roughly two suitcase slots. */
const loadUnits = (bags: number, oversize: number) => bags + oversize * 2;

export function recommendVehicle(passengers: number, bags: number, oversize: number): VehicleId {
  const load = loadUnits(bags, oversize);
  return vehicleOrder.find((v) => vehicles[v].seats >= passengers && vehicles[v].bags >= load) ?? "minibus";
}

export function vehicleFits(v: VehicleId, passengers: number, bags: number, oversize: number) {
  return vehicles[v].seats >= passengers && vehicles[v].bags >= loadUnits(bags, oversize);
}

export const isNight = (time?: string) => {
  if (!time) return false;
  const h = Number(time.split(":")[0]);
  return h >= 23 || h < 6;
};

/** `pricing: "regular"` prices the same trip at the pre-discount fare, to show what the traveller saves. */
export function quote(input: QuoteInput, pricing: "launch" | "regular" = "launch"): Quote | null {
  const dest = getDestination(input.destination);
  if (!dest) return null;
  const fare = pricing === "regular" ? dest.listEur : dest.priceEur;
  const passengers = Math.min(Math.max(1, Math.floor(input.passengers)), MAX_PASSENGERS);
  const bags = Math.max(0, Math.floor(input.bags));
  const oversize = Math.max(0, Math.floor(input.oversize));

  const recommended = recommendVehicle(passengers, bags, oversize);
  const vehicle =
    input.vehicle && vehicleFits(input.vehicle, passengers, bags, oversize) ? input.vehicle : recommended;

  const freeBags = passengers * FREE_BAGS_PER_PASSENGER;
  const extraBags = Math.max(0, bags - freeBags);
  const oversizeEur = dest.surf ? 0 : OVERSIZE_ITEM_EUR;

  const legPrice = (time?: string) => {
    const vehicleEur = Math.round(fare * vehicles[vehicle].multiplier);
    return { vehicleEur, nightEur: isNight(time) ? Math.round(vehicleEur * NIGHT_SURCHARGE) : 0 };
  };

  const out = legPrice(input.time);
  const lines: QuoteLine[] = [{ key: "base", eur: fare }];
  if (vehicle !== "car") lines.push({ key: "vehicle", eur: out.vehicleEur - fare });
  if (extraBags) lines.push({ key: "bags", eur: extraBags * EXTRA_BAG_EUR, qty: extraBags });
  if (oversize && oversizeEur) lines.push({ key: "oversize", eur: oversize * oversizeEur, qty: oversize });
  let night = out.nightEur;

  if (input.roundTrip) {
    const back = legPrice(input.returnTime);
    night += back.nightEur;
    const luggage = extraBags * EXTRA_BAG_EUR + oversize * oversizeEur;
    lines.push({ key: "return", eur: back.vehicleEur + luggage });
  }
  if (night) lines.push({ key: "night", eur: night });

  let total = lines.reduce((s, l) => s + l.eur, 0);
  if (input.roundTrip) {
    const discount = Math.round(total * ROUND_TRIP_DISCOUNT);
    lines.push({ key: "discount", eur: -discount });
    total -= discount;
  }
  // SIM data is passed on at cost, so it stays outside the round-trip discount.
  const simCards = Math.min(Math.max(0, Math.floor(input.simCards ?? 0)), passengers);
  const simEur = simCards * simPacks[input.simPack ?? "none"];
  if (simEur) {
    lines.push({ key: "sim", eur: simEur, qty: simCards });
    total += simEur;
  }
  return { vehicle, recommended, freeBags, extraBags, lines, totalEur: total };
}

/** Lowest price shown on landing pages ("from €X"). */
export const fromPrice = (slug: string) => getDestination(slug)?.priceEur ?? 0;

export { LAUNCH_DISCOUNT };
/** "20%" / "20 %" in the reader's locale. */
export const launchPercent = (locale = "en") => new Intl.NumberFormat(locale, { style: "percent" }).format(LAUNCH_DISCOUNT);
