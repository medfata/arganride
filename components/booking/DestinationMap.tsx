"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BOUNDS, COAST, PEAKS, coastPath, px } from "@/lib/coast";
import { destinations, type Destination } from "@/lib/destinations";
import type { Locale } from "@/lib/i18n/config";
import { formatDuration, t } from "@/lib/i18n/format";
import { formatMoney } from "@/lib/pricing";
import { site } from "@/lib/site";
import { IconArrow, IconCheck, IconClock, IconPlane, IconRoad } from "../Icons";

type View = "region" | "bay";
type Box = { n: number; s: number; w: number; e: number };

/**
 * What each view must keep in frame; the visible area grows to the container's aspect ratio.
 * Portrait (phone) frames are tighter: anything left outside, like Marrakech, is pinned to the edge.
 */
const BOXES: Record<"wide" | "narrow", Record<View, Box>> = {
  wide: {
    region: { n: 31.72, s: 29.3, w: -10.3, e: -7.9 },
    bay: { n: 30.63, s: 30.3, w: -9.79, e: -9.4 },
  },
  narrow: {
    region: { n: 31.6, s: 29.32, w: -10.25, e: -8.8 },
    bay: { n: 30.62, s: 30.34, w: -9.77, e: -9.5 },
  },
};

/** Places too close to tell apart at region scale; they collapse into one pin that zooms to the bay. */
const BAY = new Set(["agadir", "agadir-marina", "inezgane", "aourir", "tamraght", "taghazout", "taghazout-bay", "paradise-valley"]);
const BAY_PIN = { lat: 30.51, lng: -9.67 };
const BAY_PIN_NARROW = { lat: 30.62, lng: -9.75 };

/**
 * Where a pin is drawn when it differs from the true spot, in [lat, lng]. Pins are fixed-size photos,
 * so neighbours a few km apart get spread out and a thin leader line points back to the real place.
 */
const NUDGE_NARROW: Record<View, Record<string, [number, number]>> = {
  region: { imsouane: [31.08, -9.95], tamri: [30.76, -10.15], mirleft: [29.7, -10.06], taroudant: [30.38, -8.88] },
  bay: {
    taghazout: [30.598, -9.735],
    "taghazout-bay": [30.565, -9.66],
    tamraght: [30.52, -9.745],
    aourir: [30.495, -9.6],
    "agadir-marina": [30.445, -9.7],
    agadir: [30.39, -9.66],
    inezgane: [30.385, -9.565],
  },
};

const NUDGE: Record<View, Record<string, [number, number]>> = {
  region: { tamri: [30.72, -10.02], imsouane: [30.95, -9.98] },
  bay: {
    taghazout: [30.582, -9.735],
    "taghazout-bay": [30.55, -9.655],
    tamraght: [30.508, -9.745],
    aourir: [30.478, -9.6],
    "agadir-marina": [30.438, -9.672],
    agadir: [30.392, -9.638],
  },
};

/** Which side the name tag sits on, to keep tags off each other and off the coast. */
const SIDE: Record<string, "l" | "r"> = {
  essaouira: "r", imsouane: "l", tamri: "l", taroudant: "r", marrakech: "l", tiznit: "r", mirleft: "l",
  "sidi-ifni": "l", tafraoute: "r", taghazout: "l", "taghazout-bay": "r", tamraght: "l", aourir: "r",
  "agadir-marina": "l", agadir: "l", inezgane: "r", "paradise-valley": "r",
};

const shortName = (d: Destination) => d.name.split(" & ")[0].replace(" Resorts", "");

// Land runs off the right edge of the drawing so wide containers never show a seam.
const [farE] = px(BOUNDS.minLat, -5);
const [, farS] = px(28.5, 0);
const [, farN] = px(32.5, 0);
const [cn0x] = px(COAST[0][0], COAST[0][1]);
const [cs0x] = px(COAST[COAST.length - 1][0], COAST[COAST.length - 1][1]);
const landPath = `M${cn0x},${farN} L${coastPath.slice(1)} L${cs0x},${farS} L${farE},${farS} L${farE},${farN} Z`;

type VB = { x: number; y: number; w: number; h: number };

/** Screen-pixel margin kept around the box so edge pins and their tags are never clipped. */
const PAD = { x: 36, top: 30, bottom: 44 };

function fit(box: Box, size: { w: number; h: number }): VB {
  const [x0, y0] = px(box.n, box.w);
  const [x1, y1] = px(box.s, box.e);
  const bw = x1 - x0;
  const bh = y1 - y0;
  if (!size.w || !size.h) return { x: x0, y: y0, w: bw, h: bh };
  const iw = Math.max(1, size.w - 2 * PAD.x);
  const ih = Math.max(1, size.h - PAD.top - PAD.bottom);
  // Units per screen pixel, chosen so the box fills the padded inner area.
  const u = Math.max(bw / iw, bh / ih);
  const w = size.w * u;
  const h = size.h * u;
  const cx = x0 + bw / 2;
  const cy = y0 + bh / 2 - ((PAD.top - PAD.bottom) / 2) * u;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

export type MapLabels = {
  area: string;
  places: string;
  allRegions: string;
  hint: string;
  airport: string;
  ocean: string;
  selected: string;
  km: string;
  minutes: string;
  hours: string;
};

export function DestinationMap({
  value,
  onChange,
  locale,
  labels,
}: {
  value: string;
  onChange: (slug: string) => void;
  locale: Locale;
  labels: MapLabels;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<View>(BAY.has(value) ? "bay" : "region");
  const aspect = size.h ? size.w / size.h : 1;
  const frame = aspect < 1 ? "narrow" : "wide";
  const boxes = BOXES[frame];
  const nudges = frame === "narrow" ? NUDGE_NARROW : NUDGE;
  const target = fit(boxes[view], size);
  const [vb, setVb] = useState<VB>(target);
  const vbRef = useRef(vb);
  const measured = useRef(false);
  useEffect(() => {
    vbRef.current = vb;
  }, [vb]);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Glide between views: interpolate the centre linearly and the zoom geometrically.
  useEffect(() => {
    const from = vbRef.current;
    const to = fit(BOXES[frame][view], size);
    // First measurement or a resize: jump straight there, only view changes animate.
    if (!size.w || !measured.current || Math.abs(from.w / from.h - aspect) > 0.01) {
      measured.current = !!size.w;
      setVb(to);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = reduce ? 0 : 650;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = dur ? Math.min(1, (now - t0) / dur) : 1;
      const k = ease(p);
      const h = from.h * Math.pow(to.h / from.h, k);
      const cx = from.x + from.w / 2 + (to.x + to.w / 2 - from.x - from.w / 2) * k;
      const cy = from.y + from.h / 2 + (to.y + to.h / 2 - from.y - from.h / 2) * k;
      setVb({ x: cx - (h * aspect) / 2, y: cy - h / 2, w: h * aspect, h });
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [view, size, aspect, frame]);

  const toScreen = (lat: number, lng: number) => {
    const [x, y] = px(lat, lng);
    return [((x - vb.x) / vb.w) * size.w, ((y - vb.y) / vb.h) * size.h] as const;
  };
  // Markers outside the frame sit on its edge instead of vanishing.
  const clamp = ([x, y]: readonly [number, number], mx = 26) =>
    [Math.min(size.w - mx, Math.max(mx, x)), Math.min(size.h - 34, Math.max(26, y))] as const;
  // 0 at region scale, 1 fully zoomed into the bay; drives cross-fades.
  const regionH = fit(boxes.region, size).h;
  const bayH = fit(boxes.bay, size).h;
  const zoom = Math.min(1, Math.max(0, Math.log(regionH / vb.h) / Math.log(regionH / bayH)));

  const sel = destinations.find((d) => d.slug === value);
  const bayList = destinations.filter((d) => BAY.has(d.slug));
  const [ax, ay] = clamp(toScreen(site.geo.lat, site.geo.lng));

  const bayPin = frame === "narrow" ? BAY_PIN_NARROW : BAY_PIN;
  const pinAt = (d: Destination) => {
    const n = nudges[view][d.slug];
    const tagHalf = frame === "narrow" ? shortName(d).length * 3.1 + 10 : 0;
    return clamp(n ? toScreen(n[0], n[1]) : toScreen(d.lat, d.lng), Math.max(26, tagHalf));
  };

  // Route from the airport to the chosen place (or to the bay pin while it stands in for it).
  let route: string | null = null;
  if (sel && size.w) {
    const [dx, dy] = BAY.has(sel.slug) && view === "region" ? toScreen(bayPin.lat, bayPin.lng) : pinAt(sel);
    const cx = (ax + dx) / 2 - (dy - ay) * 0.2;
    const cy = (ay + dy) / 2 + (dx - ax) * 0.2;
    route = `M${ax},${ay} Q${cx},${cy} ${dx},${dy}`;
  }

  const visible = destinations.filter((d) => (view === "bay" ? BAY.has(d.slug) : !BAY.has(d.slug)));
  const bayPrice = Math.min(...bayList.map((d) => d.priceEur));
  const [bx, by] = toScreen(bayPin.lat, bayPin.lng);
  const [ox, oy] = view === "bay" ? toScreen(30.36, -9.76) : toScreen(frame === "narrow" ? 30.15 : 29.98, -10.2);
  const bayActive = !!sel && BAY.has(sel.slug);

  return (
    <div>
      <div
        ref={wrap}
        className="relative aspect-[2/3] w-full touch-manipulation select-none overflow-hidden rounded-2xl bg-[#cfe5ec] ring-1 ring-ink/10 sm:aspect-[6/5]"
      >
        <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="dm-land" x1="0" x2="1">
              <stop offset="0" stopColor="#f3e8d4" />
              <stop offset="1" stopColor="#e6d3b3" />
            </linearGradient>
            <radialGradient id="dm-sea" cx="0" cy="0.5" r="1">
              <stop offset="0" stopColor="#b9dbe6" />
              <stop offset="1" stopColor="#d6ebf0" />
            </radialGradient>
          </defs>
          <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} fill="url(#dm-sea)" />
          {/* Soft surf line, then land, then a crisp shoreline. */}
          <path d={coastPath} fill="none" stroke="#fbf6ee" strokeOpacity=".7" strokeWidth="10" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          <path d={landPath} fill="url(#dm-land)" />
          <path d={coastPath} fill="none" stroke="#17251c" strokeOpacity=".35" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          <g opacity={0.7 * (1 - zoom)}>
            {PEAKS.map(([la, ln], i) => {
              const [x, y] = px(la, ln);
              return <path key={i} d={`M${x - 16},${y + 10} L${x},${y - 14} L${x + 16},${y + 10}`} fill="#d9c29f" stroke="#b89b72" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />;
            })}
          </g>
        </svg>

        {/* Screen-space overlay: route and leader lines keep a constant weight at any zoom. */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          {route && (
            <path d={route} fill="none" stroke="#2f6a43" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 8" key={value + view}>
              <animate attributeName="stroke-dashoffset" from="120" to="0" dur="1.2s" fill="freeze" />
            </path>
          )}
          {visible.map((d) => {
            if (!nudges[view][d.slug]) return null;
            const [tx, ty] = toScreen(d.lat, d.lng);
            const [pxx, pyy] = pinAt(d);
            return (
              <g key={d.slug} opacity={view === "bay" ? zoom : 1 - zoom}>
                <line x1={tx} y1={ty} x2={pxx} y2={pyy} stroke="#17251c" strokeOpacity=".35" strokeWidth="1.2" />
                <circle cx={tx} cy={ty} r="3" fill="#17251c" fillOpacity=".55" />
              </g>
            );
          })}
        </svg>

        {size.w > 0 && (
          <>
            <span
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 -rotate-[78deg] whitespace-nowrap font-display text-base italic tracking-wide text-ocean/45 sm:text-xl"
              style={{ left: ox, top: oy }}
            >
              {labels.ocean}
            </span>

            {/* Airport */}
            <span className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: ax, top: ay }}>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-paper shadow-lg ring-[3px] ring-white sm:h-9 sm:w-9">
                <IconPlane className="h-4 w-4" />
              </span>
              <span
                className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-ink px-1.5 py-0.5 text-[0.65rem] font-bold tracking-wider text-paper ${
                  frame === "narrow"
                    ? "left-1/2 top-full mt-1 -translate-x-1/2 translate-y-0"
                    : ax > size.w - 80
                      ? "right-full mr-1.5"
                      : "left-full ml-1.5"
                }`}
              >
                AGA
              </span>
            </span>

            {/* The bay cluster pin, region view only */}
            {zoom < 0.98 && (
              <button
                type="button"
                onClick={() => setView("bay")}
                className="group absolute z-20 -translate-x-1/2 -translate-y-1/2 outline-none"
                style={{ left: bx, top: by, opacity: 1 - zoom, pointerEvents: view === "region" ? "auto" : "none" }}
                aria-label={`${labels.area} — ${t(labels.places, { n: bayList.length })}`}
              >
                <span className="relative flex">
                  {bayList.slice(0, 3).map((d, i) => (
                    <span
                      key={d.slug}
                      className={`relative block h-8 w-8 overflow-hidden rounded-full shadow-md ring-[3px] transition sm:h-11 sm:w-11 ${i ? "-ml-4 sm:-ml-5" : ""} ${
                        bayActive ? "ring-primary" : "ring-white"
                      } group-hover:-translate-y-0.5 group-focus-visible:ring-primary`}
                      style={{ zIndex: 3 - i }}
                    >
                      <Image src={`/images/${d.image}.webp`} alt="" fill sizes="48px" className="object-cover" />
                    </span>
                  ))}
                  <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[0.65rem] font-bold text-white ring-2 ring-white">
                    {bayList.length}
                  </span>
                </span>
                <span
                  className={`absolute flex flex-col whitespace-nowrap rounded-xl shadow-md ring-1 ${
                    frame === "narrow"
                      ? "left-full top-1/2 ml-2 -translate-y-1/2 items-start px-2 py-0.5 text-left"
                      : "right-full top-1/2 mr-2 -translate-y-1/2 items-end px-2.5 py-1 text-right"
                  } ${
                    bayActive ? "bg-primary text-white ring-primary" : "bg-white/95 ring-ink/10"
                  }`}
                >
                  <span className="text-[0.65rem] font-bold leading-tight sm:text-sm">{labels.area}</span>
                  <span className={`text-[0.6rem] font-medium leading-tight sm:text-xs ${frame === "narrow" ? "hidden" : ""} ${bayActive ? "text-white/80" : "text-muted"}`}>
                    {t(labels.places, { n: bayList.length })} · {formatMoney(bayPrice, "EUR", locale)}+
                  </span>
                </span>
              </button>
            )}

            {/* Place pins */}
            {destinations.map((d) => {
              const inView = view === "bay" ? BAY.has(d.slug) : !BAY.has(d.slug);
              const o = BAY.has(d.slug) ? zoom : 1 - zoom;
              if (o < 0.02) return null;
              const [x, y] = pinAt(d);
              const active = d.slug === value;
              // Rough tag width (sm+ shows name and price) to flip tags that would run off the map.
              const tagW = shortName(d).length * 7 + 52;
              let side = SIDE[d.slug] ?? "r";
              if (side === "l" && x - 30 - tagW < 4) side = "r";
              else if (side === "r" && x + 30 + tagW > size.w - 4) side = "l";
              return (
                <button
                  key={d.slug}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={`${d.name}, ${formatMoney(d.priceEur, "EUR", locale)}`}
                  onClick={() => onChange(d.slug)}
                  tabIndex={inView ? 0 : -1}
                  className={`group absolute -translate-x-1/2 -translate-y-1/2 outline-none ${active ? "z-30" : "z-20 hover:z-30 focus-visible:z-30"}`}
                  style={{ left: x, top: y, opacity: o, pointerEvents: inView ? "auto" : "none" }}
                >
                  <span
                    className={`relative block overflow-hidden rounded-full shadow-[0_6px_14px_-4px_rgba(23,37,28,.5)] transition duration-200 group-hover:scale-110 group-focus-visible:scale-110 ${
                      active ? "h-11 w-11 ring-4 ring-primary sm:h-14 sm:w-14" : "h-8 w-8 ring-[3px] ring-white sm:h-11 sm:w-11"
                    }`}
                  >
                    <Image src={`/images/${d.image}.webp`} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  {active && (
                    <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-white ring-2 ring-white">
                      <IconCheck className="h-3 w-3" />
                    </span>
                  )}
                  <span
                    className={`absolute left-1/2 top-full mt-1 flex -translate-x-1/2 whitespace-nowrap rounded-full px-1.5 py-px text-[0.62rem] font-semibold leading-snug shadow ring-1 transition sm:top-1/2 sm:mt-0 sm:-translate-y-1/2 sm:translate-x-0 sm:px-2 sm:py-0.5 sm:text-xs ${
                      side === "l" ? "sm:left-auto sm:right-full sm:mr-1.5" : "sm:left-full sm:ml-1.5"
                    } ${active ? "bg-primary text-white ring-primary" : "bg-white/95 ring-ink/10"}`}
                  >
                    {shortName(d)}
                    <span className={`ml-1 tabular-nums ${active ? "text-white/85" : "hidden text-primary sm:inline"}`}>{formatMoney(d.priceEur, "EUR", locale)}</span>
                  </span>
                </button>
              );
            })}

            {view === "bay" && (
              <button
                type="button"
                onClick={() => setView("region")}
                className="absolute left-3 top-3 z-40 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold shadow-md ring-1 ring-ink/10 transition hover:bg-white"
              >
                <IconArrow className="h-4 w-4 rotate-180" /> {labels.allRegions}
              </button>
            )}
            {!sel && (
              <p className="pointer-events-none absolute inset-x-3 bottom-3 z-40 mx-auto w-fit rounded-full bg-ink/85 px-3 py-1.5 text-center text-xs font-medium text-paper backdrop-blur">
                {labels.hint}
              </p>
            )}
          </>
        )}
      </div>

      {sel && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-2 pr-4" aria-live="polite">
          <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl">
            <Image src={`/images/${sel.image}.webp`} alt="" fill sizes="80px" className="object-cover" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.65rem] font-bold uppercase tracking-[0.18em] text-primary">{labels.selected}</span>
            <span className="block truncate font-semibold">{sel.name}</span>
            <span className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <IconRoad className="h-3.5 w-3.5" />
                {t(labels.km, { n: sel.km })}
              </span>
              <span className="inline-flex items-center gap-1">
                <IconClock className="h-3.5 w-3.5" />
                {formatDuration(sel.minutes, labels)}
              </span>
            </span>
          </span>
          <span className="font-display text-2xl tabular-nums">
            <s className="mr-1.5 align-middle font-sans text-sm text-muted">{formatMoney(sel.listEur, "EUR", locale)}</s>
            {formatMoney(sel.priceEur, "EUR", locale)}
          </span>
        </div>
      )}
    </div>
  );
}
