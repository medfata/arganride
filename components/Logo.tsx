/** Horseshoe arch framing an Atlantic sunset — the brand mark. */
export function LogoMark({ className = "h-9 w-9", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path d="M6 38V18a14 14 0 0 1 28 0v20z" fill={tone === "light" ? "#fbf6ee" : "#0f2430"} />
      <circle cx="20" cy="22" r="7" fill="#e3aa45" />
      <path d="M8 28c3-2 6-2 9 0s6 2 9 0 5-2 6-1v11H8z" fill="#2a9fb4" />
      <path d="M8 33c3-2 6-2 9 0s6 2 9 0 5-2 6-1v6H8z" fill="#0b6e99" />
    </svg>
  );
}

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark tone={tone} />
      <span className="leading-none">
        <span className={`block font-display text-[1.45rem] tracking-tight ${tone === "light" ? "text-paper" : "text-ink"}`}>
          Aga Taxi
        </span>
        <span className={`mt-1 block text-[0.6rem] font-bold uppercase tracking-[0.28em] ${tone === "light" ? "text-saffron" : "text-primary"}`}>
          Agadir Airport
        </span>
      </span>
    </span>
  );
}
