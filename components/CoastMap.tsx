"use client";

import Link from "next/link";
import { useState } from "react";
import { destinations } from "@/lib/destinations";
import type { Locale } from "@/lib/i18n/config";
import { formatDuration, t } from "@/lib/i18n/format";
import { formatMoney } from "@/lib/pricing";
import { site } from "@/lib/site";
import { IconArrow, IconClock, IconRoad } from "./Icons";

// Equirectangular projection tuned to the Souss coast.
const BOUNDS = { minLng: -10.45, maxLng: -7.75, minLat: 29.15, maxLat: 31.85 };
const K = 430;
const COS = Math.cos((30.5 * Math.PI) / 180);
const W = Math.round((BOUNDS.maxLng - BOUNDS.minLng) * COS * K);
const H = Math.round((BOUNDS.maxLat - BOUNDS.minLat) * K);
const px = (lat: number, lng: number) => [(lng - BOUNDS.minLng) * COS * K, (BOUNDS.maxLat - lat) * K] as const;

const COAST: [number, number][] = [
  [31.85, -9.69], [31.66, -9.68], [31.51, -9.77], [31.4, -9.84], [31.3, -9.8], [31.12, -9.83], [31.02, -9.86],
  [30.9, -9.83], [30.84, -9.83], [30.75, -9.86], [30.64, -9.89], [30.58, -9.8], [30.545, -9.72], [30.51, -9.69],
  [30.49, -9.665], [30.44, -9.65], [30.42, -9.635], [30.39, -9.605], [30.36, -9.6], [30.2, -9.63], [30.05, -9.68],
  [29.9, -9.76], [29.8, -9.84], [29.7, -9.93], [29.58, -10.04], [29.45, -10.12], [29.38, -10.18], [29.15, -10.33],
];

const coastPath = COAST.map(([la, ln], i) => `${i ? "L" : "M"}${px(la, ln).map((n) => n.toFixed(1)).join(",")}`).join(" ");
const landPath = `${coastPath} L${W},${H} L${W},0 Z`;

// Mountain glyphs for the High Atlas and Anti-Atlas.
const PEAKS: [number, number][] = [
  [31.05, -8.4], [30.98, -8.75], [30.9, -9.05], [31.15, -8.1], [30.82, -9.3], [31.25, -8.6],
  [29.9, -9.2], [29.8, -8.75], [29.6, -9.4], [29.95, -8.4], [29.55, -8.9],
];

// Where the label sits relative to the dot; clustered Agadir-area places only label when selected.
const LABEL: Record<string, "l" | "r" | "hide"> = {
  agadir: "r", "agadir-marina": "hide", inezgane: "hide", aourir: "hide", tamraght: "hide", "taghazout-bay": "hide",
  taghazout: "l", tamri: "l", imsouane: "l", essaouira: "l", mirleft: "l", "sidi-ifni": "l", tiznit: "r",
  "paradise-valley": "r", taroudant: "r", tafraoute: "r", marrakech: "l",
};

export function CoastMap({
  locale,
  labels,
}: {
  locale: Locale;
  labels: { airport: string; from: string; book: string; minutes: string; hours: string; km: string; details: string };
}) {
  const [sel, setSel] = useState("taghazout");
  const d = destinations.find((x) => x.slug === sel)!;
  const [ax, ay] = px(site.geo.lat, site.geo.lng);
  const [dx, dy] = px(d.lat, d.lng);
  // Bow the route towards the coast so it reads like a road, not a flight path.
  const cx = (ax + dx) / 2 - (dy - ay) * 0.18;
  const cy = (ay + dy) / 2 + (dx - ax) * 0.18;
  const route = `M${ax},${ay} Q${cx},${cy} ${dx},${dy}`;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.25fr_1fr]">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#d9e6e2] ring-1 ring-ink/10">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Map of the Souss-Massa coast from Essaouira to Sidi Ifni">
          <defs>
            <pattern id="waves" width="48" height="16" patternUnits="userSpaceOnUse">
              <path d="M0 8c6-5 12-5 18 0s12 5 18 0 8-4 12-2" fill="none" stroke="#1d6b74" strokeOpacity=".16" strokeWidth="1.5" />
            </pattern>
            <linearGradient id="land" x1="0" x2="1">
              <stop offset="0" stopColor="#efe1c9" />
              <stop offset="1" stopColor="#e2cba7" />
            </linearGradient>
          </defs>
          <rect width={W} height={H} fill="url(#waves)" />
          <path d={landPath} fill="url(#land)" />
          <path d={coastPath} fill="none" stroke="#0f2430" strokeOpacity=".55" strokeWidth="2.5" strokeLinejoin="round" />
          <path d={coastPath} fill="none" stroke="#fbf6ee" strokeWidth="9" strokeOpacity=".5" transform="translate(-7,0)" />

          {PEAKS.map(([la, ln], i) => {
            const [x, y] = px(la, ln);
            return <path key={i} d={`M${x - 16},${y + 10} L${x},${y - 14} L${x + 16},${y + 10}`} fill="#c9ad86" stroke="#a88a62" strokeWidth="1.5" opacity=".75" />;
          })}

          <text x={px(31.0, -10.25)[0]} y={px(31.0, -10.25)[1]} className="fill-ocean/50 font-display" fontSize="34" transform={`rotate(-80 ${px(31.0, -10.25).join(" ")})`}>
            Atlantic Ocean
          </text>

          <path d={route} fill="none" stroke="#c0512c" strokeWidth="5" strokeLinecap="round" strokeDasharray="2 12" key={sel}>
            <animate attributeName="stroke-dashoffset" from="200" to="0" dur="1.6s" fill="freeze" />
          </path>

          {destinations.map((x) => {
            const [mx, my] = px(x.lat, x.lng);
            const active = x.slug === sel;
            const side = active ? (LABEL[x.slug] === "l" ? "l" : "r") : LABEL[x.slug];
            return (
              <g
                key={x.slug}
                role="button"
                tabIndex={0}
                aria-label={x.name}
                aria-pressed={active}
                className="cursor-pointer outline-none [&:focus-visible>circle:first-child]:stroke-terracotta"
                onClick={() => setSel(x.slug)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSel(x.slug))}
              >
                <circle cx={mx} cy={my} r="22" fill="transparent" stroke="transparent" strokeWidth="3" />
                {active && <circle cx={mx} cy={my} r="20" fill="#c0512c" opacity=".18" />}
                <circle cx={mx} cy={my} r={active ? 10 : 7} fill={active ? "#c0512c" : "#0f2430"} stroke="#fbf6ee" strokeWidth="3" />
                {side !== "hide" && (
                  <text
                    x={side === "l" ? mx - 16 : mx + 16}
                    y={my + 7}
                    textAnchor={side === "l" ? "end" : "start"}
                    fontSize={active ? 30 : 24}
                    className={`font-sans ${active ? "fill-terracotta font-bold" : "fill-ink font-semibold"}`}
                    paintOrder="stroke"
                    stroke="#f4eadb"
                    strokeWidth="6"
                  >
                    {x.name.split(" & ")[0].replace(" Resorts", "")}
                  </text>
                )}
              </g>
            );
          })}

          <g aria-hidden="true">
            <circle cx={ax} cy={ay} r="24" fill="#0f2430" />
            <path
              transform={`translate(${ax - 13},${ay - 13}) scale(1.1)`}
              d="M2.5 19h19M3.8 12.6l3.3 3.2a2 2 0 0 0 2 .5L20 13a1.8 1.8 0 0 0-1-3.5l-4 1-5.5-5.4-2 .6 3 5.8-3.6 1-2-1.7-1.6.5z"
              fill="none"
              stroke="#eba937"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <text x={ax + 32} y={ay + 10} fontSize="28" className="fill-ink font-sans font-bold" paintOrder="stroke" stroke="#f4eadb" strokeWidth="6">
              AGA · {labels.airport}
            </text>
          </g>
        </svg>
      </div>

      <div className="lg:sticky lg:top-28">
        <div className="card overflow-hidden">
          <div className="bg-ink p-6 text-paper">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-saffron">AGA → {d.name}</p>
            <p className="mt-3 font-display text-5xl leading-none">
              <span className="text-lg align-top text-paper/60">{labels.from} </span>
              {formatMoney(d.priceEur, "EUR", locale)}
            </p>
            <div className="mt-5 flex gap-6 text-sm text-paper/80">
              <span className="inline-flex items-center gap-2"><IconRoad className="h-4 w-4 text-saffron" />{t(labels.km, { n: d.km })}</span>
              <span className="inline-flex items-center gap-2"><IconClock className="h-4 w-4 text-saffron" />{formatDuration(d.minutes, labels)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 p-4">
            <Link href={`/${locale}/book?to=${d.slug}`} className="btn btn-primary flex-1">
              {labels.book} <IconArrow className="h-4 w-4" />
            </Link>
            <Link href={`/${locale}/destinations/${d.slug}`} className="btn btn-ghost flex-1">
              {labels.details}
            </Link>
          </div>
        </div>
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Destinations">
          {destinations.map((x) => (
            <li key={x.slug}>
              <button
                type="button"
                onClick={() => setSel(x.slug)}
                aria-pressed={x.slug === sel}
                className="rounded-full border border-ink/15 px-3 py-1.5 text-sm font-medium transition hover:border-ink/40 aria-pressed:border-terracotta aria-pressed:bg-terracotta aria-pressed:text-white"
              >
                {x.name.split(" & ")[0]}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
