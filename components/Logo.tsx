/**
 * Brand mark: a Moroccan horseshoe arch — the gateway you arrive through — glowing argan-oil gold,
 * with the flat, wide crown of an argan tree (it grows almost nowhere but the Souss, our home)
 * above an Atlantic swell. Few, bold shapes so it holds at favicon size. Plain elements
 * (no hooks, no classes) so the OG card and app icons can render it through next/og.
 */
export function markShapes(ink: string) {
  return [
    <path key="arch" d="M8.5 38V21.6A12.8 12.8 0 1 1 31.5 21.6V38z" fill="#dea03a" />,
    <path
      key="crown"
      d="M10 21.4c0-2 1.6-3.1 3.2-3 .7-1.6 2.2-2.4 3.8-2.2.8-1 1.9-1.5 3-1.5s2.2.5 3 1.5c1.6-.2 3.1.6 3.8 2.2 1.6-.1 3.2 1 3.2 3 0 1-.8 1.7-1.8 1.7H11.8c-1 0-1.8-.7-1.8-1.7z"
      fill={ink}
    />,
    <path key="trunk" d="M18.3 33.2l.6-4.9-4-5.3h2.2l2.2 3.2.2-3.2h1l.2 3.2 2.2-3.2h2.2l-4 5.3.6 4.9z" fill={ink} />,
    <path key="sea" d="M8.5 32.6c3.8-2.2 7.7-2.2 11.5 0s7.7 2.2 11.5 0V38h-23z" fill="#127a8a" />,
  ];
}

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      {markShapes("#17251c")}
    </svg>
  );
}

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className="leading-none">
        <span className={`block font-display text-[1.45rem] tracking-tight ${tone === "light" ? "text-paper" : "text-ink"}`}>
          Argan Ride
        </span>
        <span className={`mt-1 block text-[0.6rem] font-bold uppercase tracking-[0.28em] ${tone === "light" ? "text-saffron" : "text-primary"}`}>
          Morocco transfers
        </span>
      </span>
    </span>
  );
}
