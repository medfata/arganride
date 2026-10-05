import { NextResponse, type NextRequest } from "next/server";
import { airlines, parseFlightNumber } from "@/lib/airlines";

/**
 * Optional live flight lookup via AeroDataBox (RapidAPI). Set AERODATABOX_API_KEY to enable.
 * Without a key this returns 404 and the booking form falls back to manual time entry.
 */
export async function GET(request: NextRequest) {
  const number = request.nextUrl.searchParams.get("number") ?? "";
  const date = request.nextUrl.searchParams.get("date") ?? "";
  const type = request.nextUrl.searchParams.get("type") === "departure" ? "departure" : "arrival";
  const parsed = parseFlightNumber(number);
  if (!parsed || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const key = process.env.AERODATABOX_API_KEY;
  if (!key) return NextResponse.json({ error: "lookup_disabled" }, { status: 404 });

  try {
    const res = await fetch(
      `https://aerodatabox.p.rapidapi.com/flights/number/${parsed.code}${parsed.number}/${date}?withAircraftImage=false&withLocation=false`,
      {
        headers: { "X-RapidAPI-Key": key, "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com" },
        next: { revalidate: 900 },
      },
    );
    if (!res.ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const flights = (await res.json()) as AdbFlight[];
    // A flight number can cover several legs; keep the one that lands at / leaves from Agadir.
    const end = (f: AdbFlight) => (type === "arrival" ? f.arrival : f.departure);
    const f = flights.find((x) => end(x)?.airport?.iata === "AGA");
    if (!f) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({
      airline: f.airline?.name ?? airlines[parsed.code]?.name,
      origin: f.departure?.airport?.municipalityName ?? f.departure?.airport?.name,
      destination: f.arrival?.airport?.municipalityName ?? f.arrival?.airport?.name,
      time: end(f)?.scheduledTime?.local?.match(/\d{2}:\d{2}/)?.[0],
      status: f.status,
    });
  } catch {
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }
}

type AdbEnd = { airport?: { iata?: string; name?: string; municipalityName?: string }; scheduledTime?: { local?: string } };
type AdbFlight = { departure?: AdbEnd; arrival?: AdbEnd; airline?: { name?: string }; status?: string };
