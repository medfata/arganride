import { parseFlightNumber } from "./airlines";
import { getDestination } from "./destinations";
import { MAX_PASSENGERS, vehicleOrder, type SimPack, type VehicleId } from "./pricing";

export type Direction = "arrival" | "departure" | "round";

export type FlightLeg = { number: string; date: string; time: string; unknown?: boolean };

export type BookingDraft = {
  direction: Direction;
  outbound: FlightLeg;
  inbound: FlightLeg; // the flight home, only used for round trips
  destination: string;
  address: string;
  passengers: number;
  childSeats: number;
  bags: number;
  oversize: number;
  vehicle: VehicleId | null;
  /** Free SIM cards handed over on arrival (none for trips to the airport). */
  simCards: number;
  simPack: SimPack;
  /** Free stops on the way. */
  stopAtm: boolean;
  stopShop: boolean;
  name: string;
  email: string;
  phone: string;
  sign: string;
  notes: string;
};

export const emptyLeg: FlightLeg = { number: "", date: "", time: "" };

/** SIM cards only make sense when the traveller is landing. */
export const simCardsFor = (b: Pick<BookingDraft, "direction" | "simCards" | "passengers">) =>
  b.direction === "departure" ? 0 : Math.min(b.simCards, b.passengers);

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^\+?[0-9][0-9 ()./-]{6,20}$/;
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Minutes to be at the terminal before take-off. */
export const AIRPORT_LEAD_MIN = 120;

export const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};
export const fromMinutes = (mins: number) => {
  const m = ((mins % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

/** For trips to the airport: when should the driver pick up? Rounded down to 5 minutes. */
export function pickupBeforeFlight(flightTime: string, driveMinutes: number) {
  const lead = AIRPORT_LEAD_MIN + Math.ceil(driveMinutes / 5) * 5;
  const raw = toMinutes(flightTime) - lead;
  return { time: fromMinutes(Math.floor(raw / 5) * 5), leadMinutes: lead, previousDay: raw < 0 };
}

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export type ErrorKey = "required" | "email" | "phone" | "flight" | "date" | "destination" | "returnDate";
export type FieldErrors = Partial<Record<string, ErrorKey>>;

function validateLeg(prefix: string, leg: FlightLeg, errors: FieldErrors, today: string) {
  if (!leg.unknown) {
    if (!leg.number.trim()) errors[`${prefix}.number`] = "required";
    else if (!parseFlightNumber(leg.number)) errors[`${prefix}.number`] = "flight";
  }
  if (!DATE_RE.test(leg.date)) errors[`${prefix}.date`] = "required";
  else if (leg.date < today) errors[`${prefix}.date`] = "date";
  if (!TIME_RE.test(leg.time)) errors[`${prefix}.time`] = "required";
}

export function validateStep(step: number, b: BookingDraft, today = todayISO()): FieldErrors {
  const e: FieldErrors = {};
  if (step === 0) {
    validateLeg("outbound", b.outbound, e, today);
    if (b.direction === "round") {
      validateLeg("inbound", b.inbound, e, today);
      if (!e["inbound.date"] && !e["outbound.date"] && `${b.inbound.date}T${b.inbound.time}` <= `${b.outbound.date}T${b.outbound.time}`)
        e["inbound.date"] = "returnDate";
    }
  }
  if (step === 1) {
    if (!getDestination(b.destination)) e.destination = "destination";
  }
  if (step === 2) {
    if (b.passengers < 1 || b.passengers > MAX_PASSENGERS) e.passengers = "required";
    if (b.vehicle && !vehicleOrder.includes(b.vehicle)) e.vehicle = "required";
  }
  if (step === 3) {
    if (b.name.trim().length < 2) e.name = "required";
    if (!EMAIL_RE.test(b.email.trim())) e.email = "email";
    if (!PHONE_RE.test(b.phone.trim())) e.phone = "phone";
  }
  return e;
}

export const validateAll = (b: BookingDraft, today?: string) =>
  [0, 1, 2, 3].reduce<FieldErrors>((acc, s) => ({ ...acc, ...validateStep(s, b, today) }), {});

export function bookingReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `AGA-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")}`;
}
