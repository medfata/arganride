"use client";

import { useEffect, useState } from "react";

export type BoardRow = { dest: string; drive: string; price: string };

function FlapText({ text, width, className = "" }: { text: string; width: number; className?: string }) {
  const chars = text.toUpperCase().padEnd(width, " ").slice(0, width).split("");
  return (
    <span className={`inline-flex ${className}`} aria-hidden="true">
      {chars.map((c, i) => (
        // Keying by character remounts the cell when it changes, which replays the flip.
        <span key={`${i}-${c}`} className="flap" data-flip="true" style={{ animationDelay: `${i * 18}ms` }}>
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );
}

export function FlapBoard({
  rows,
  statuses,
  headers,
  visible = 5,
}: {
  rows: BoardRow[];
  statuses: string[];
  headers: { destination: string; drive: string; price: string; status: string };
  visible?: number;
}) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setOffset((o) => (o + 1) % rows.length), 4200);
    return () => clearInterval(id);
  }, [rows.length]);

  const shown = Array.from({ length: visible }, (_, i) => rows[(offset + i) % rows.length]);

  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-[#0d1710] p-3 shadow-[0_40px_80px_-40px_rgba(0,0,0,.8)] ring-1 ring-white/10 sm:p-5">
      <table className="w-full border-separate border-spacing-y-1.5 text-[11px] sm:text-[13px] lg:text-[15px]">
        <caption className="sr-only">{headers.destination}</caption>
        <thead>
          <tr className="text-left text-[0.62rem] font-bold uppercase tracking-[0.2em] text-saffron/80 sm:text-xs">
            <th scope="col" className="pb-2 pl-1 font-bold">{headers.destination}</th>
            <th scope="col" className="hidden pb-2 font-bold md:table-cell">{headers.drive}</th>
            <th scope="col" className="pb-2 font-bold">{headers.price}</th>
            <th scope="col" className="hidden pb-2 font-bold lg:table-cell">{headers.status}</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((r, i) => (
            <tr key={i}>
              <td className="pl-1">
                <span className="sr-only">{r.dest}</span>
                <FlapText text={r.dest} width={15} />
              </td>
              <td className="hidden md:table-cell">
                <span className="sr-only">{r.drive}</span>
                <FlapText text={r.drive} width={7} />
              </td>
              <td>
                <span className="sr-only">{r.price}</span>
                <FlapText text={r.price} width={5} className="[&>.flap]:text-saffron" />
              </td>
              <td className="hidden lg:table-cell">
                <span className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-emerald-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  {statuses[(offset + i) % statuses.length]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
