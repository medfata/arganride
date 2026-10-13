import { NextResponse, type NextRequest } from "next/server";
import { airlines, parseFlightNumber } from "@/lib/airlines";

/**
 * The day's scheduled arrivals or departures at Agadir (AGA), so travellers can pick their flight
 * from a list instead of typing the number. AeroDataBox caps a FIDS window at 12 hours and bills
 * per call, so a day is two calls with both directions in each, cached hard: one pair of calls
 * serves every visitor and both directions for that date.
 */
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? "";
  const type = request.nextUrl.searchParams.get("type") === "departure" ? "departure" : "arrival";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const key = process.env.AERODATABOX_API_KEY;
  if (!key) return NextResponse.json({ error: "lookup_disabled" }, { status: 404 });

  // Schedules weeks out barely move; near-term ones pick up retimings.
  const daysAhead = (Date.parse(date) - Date.now()) / 86_400_000;
  const revalidate = daysAhead < 2 ? 60 * 60 : 60 * 60 * 12;

  try {
    const halves = await Promise.all(
      [
        ["00:00", "11:59"],
        ["12:00", "23:59"],
      ].map(async ([from, to]) => {
        const res = await fetch(
          `https://aerodatabox.p.rapidapi.com/flights/airports/iata/AGA/${date}T${from}/${date}T${to}` +
            "?direction=Both&withLeg=false&withCancelled=false&withCodeshared=false&withCargo=false&withPrivate=false",
          {
            headers: { "X-RapidAPI-Key": key, "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com" },
            next: { revalidate },
          },
        );
        // 204 means no flights in the window.
        if (res.status === 204) return [];
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { arrivals?: AdbMovement[]; departures?: AdbMovement[] };
        return (type === "arrival" ? data.arrivals : data.departures) ?? [];
      }),
    );

    const seen = new Set<string>();
    const flights = halves
      .flat()
      .map((f) => {
        const code = parseFlightNumber(f.number ?? "")?.code ?? "";
        return {
          number: f.number?.replace(/\s+/g, " ").trim() ?? "",
          code,
          // Our own names first: the feed mislabels some carriers.
          airline: airlines[code]?.name ?? f.airline?.name ?? "",
          city: f.movement?.airport?.municipalityName ?? f.movement?.airport?.name ?? "",
          iata: f.movement?.airport?.iata ?? "",
          country: countryOf(f.movement?.airport?.countryCode),
          time: f.movement?.scheduledTime?.local?.match(/\d{2}:\d{2}/)?.[0] ?? "",
        };
      })
      .filter((f) => f.number && f.time && !seen.has(f.number) && seen.add(f.number))
      .sort((a, b) => a.time.localeCompare(b.time));

    return NextResponse.json({ flights }, { headers: { "Cache-Control": `public, s-maxage=${revalidate}, stale-while-revalidate=600` } });
  } catch {
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }
}

// Airports in the southern provinces (Dakhla, Laayoune…) are listed under "EH"; we show them as Morocco.
const countryOf = (code?: string) => {
  const cc = code?.toLowerCase() ?? "";
  return cc === "eh" ? "ma" : cc;
};

type AdbMovement = {
  number?: string;
  airline?: { name?: string };
  movement?: { airport?: { iata?: string; name?: string; municipalityName?: string; countryCode?: string }; scheduledTime?: { local?: string } };
};
