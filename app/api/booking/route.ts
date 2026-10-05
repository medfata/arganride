import { NextResponse } from "next/server";
import { bookingReference, pickupBeforeFlight, validateAll, type BookingDraft } from "@/lib/booking";
import { getDestination } from "@/lib/destinations";
import { hasLocale } from "@/lib/i18n/config";
import { quote, vehicles, type VehicleId } from "@/lib/pricing";
import { site } from "@/lib/site";

type Payload = Partial<BookingDraft> & { locale?: string; currency?: string };

const clip = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const int = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
};

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Normalise and bound every field before trusting it.
  const leg = (l: Partial<BookingDraft["outbound"]> | undefined) => ({
    number: clip(l?.number, 12),
    date: clip(l?.date, 10),
    time: clip(l?.time, 5),
    unknown: Boolean(l?.unknown),
  });
  const b: BookingDraft = {
    direction: body.direction === "departure" || body.direction === "round" ? body.direction : "arrival",
    outbound: leg(body.outbound),
    inbound: leg(body.inbound),
    destination: clip(body.destination, 40),
    address: clip(body.address, 300),
    passengers: int(body.passengers, 1, 16, 1),
    childSeats: int(body.childSeats, 0, 4, 0),
    bags: int(body.bags, 0, 40, 0),
    oversize: int(body.oversize, 0, 16, 0),
    vehicle: typeof body.vehicle === "string" && body.vehicle in vehicles ? (body.vehicle as VehicleId) : null,
    name: clip(body.name, 120),
    email: clip(body.email, 160),
    phone: clip(body.phone, 30),
    sign: clip(body.sign, 120),
    notes: clip(body.notes, 1000),
  };

  // Accept "today" from any timezone the traveller might be in.
  const earliest = new Date(Date.now() - 36 * 3600 * 1000).toISOString().slice(0, 10);
  const errors = validateAll(b, earliest);
  if (Object.keys(errors).length) return NextResponse.json({ error: "validation", fields: errors }, { status: 422 });

  const dest = getDestination(b.destination)!;
  const outTime = b.direction === "departure" ? pickupBeforeFlight(b.outbound.time, dest.minutes).time : b.outbound.time;
  const backTime = b.direction === "round" ? pickupBeforeFlight(b.inbound.time, dest.minutes).time : undefined;
  const q = quote({
    destination: b.destination,
    passengers: b.passengers,
    bags: b.bags,
    oversize: b.oversize,
    vehicle: b.vehicle ?? undefined,
    time: outTime,
    returnTime: backTime,
    roundTrip: b.direction === "round",
  })!;

  const ref = bookingReference();
  const locale = hasLocale(body.locale ?? "") ? body.locale : "en";
  const arrow = b.direction === "departure" ? "←" : b.direction === "round" ? "⇄" : "→";
  const text = [
    `New booking ${ref} (${locale})`,
    `${b.direction.toUpperCase()}: AGA ${arrow} ${dest.name}`,
    `Address: ${b.address}`,
    `Flight: ${b.outbound.unknown ? "TBC" : b.outbound.number} on ${b.outbound.date} at ${b.outbound.time} (pickup ${outTime})`,
    b.direction === "round"
      ? `Return flight: ${b.inbound.unknown ? "TBC" : b.inbound.number} on ${b.inbound.date} at ${b.inbound.time} (pickup ${backTime})`
      : "",
    `Passengers: ${b.passengers}, child seats: ${b.childSeats}, bags: ${b.bags}, sports bags: ${b.oversize}`,
    `Vehicle: ${q.vehicle}, total: EUR ${q.totalEur}`,
    `Client: ${b.name}, ${b.email}, ${b.phone}`,
    b.sign ? `Sign: ${b.sign}` : "",
    b.notes ? `Notes: ${b.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  await notify(ref, text, b.email);

  return NextResponse.json({ ref, totalEur: q.totalEur, vehicle: q.vehicle });
}

/**
 * Delivery channels are opt-in via environment variables so the site works out of the box:
 *  - RESEND_API_KEY + BOOKING_EMAIL_TO      → email to dispatch, client in CC
 *  - TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID  → instant message to the drivers' group
 *  - BOOKING_WEBHOOK_URL                    → POST JSON anywhere (Zapier, Make, n8n, Sheets…)
 */
async function notify(ref: string, text: string, clientEmail: string) {
  const { RESEND_API_KEY, BOOKING_EMAIL_TO, BOOKING_EMAIL_FROM, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, BOOKING_WEBHOOK_URL } = process.env;
  const tasks: Promise<Response>[] = [];

  if (RESEND_API_KEY && BOOKING_EMAIL_TO) {
    tasks.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: BOOKING_EMAIL_FROM ?? `${site.name} <bookings@${new URL(site.url).hostname}>`,
          to: [BOOKING_EMAIL_TO],
          cc: [clientEmail],
          reply_to: clientEmail,
          subject: `${site.name} booking ${ref}`,
          text,
        }),
      }),
    );
  }
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    tasks.push(
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
      }),
    );
  }
  if (BOOKING_WEBHOOK_URL) {
    tasks.push(fetch(BOOKING_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ref, text }) }));
  }
  if (!tasks.length) console.info(`[booking] no delivery channel configured\n${text}`);

  for (const r of await Promise.allSettled(tasks)) {
    if (r.status === "rejected") console.error("[booking] notify failed", r.reason);
    else if (!r.value.ok) console.error("[booking] notify failed", r.value.status, await r.value.text().catch(() => ""));
  }
}
