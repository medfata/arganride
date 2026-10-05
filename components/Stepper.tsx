"use client";

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  label,
  id,
  tone = "light",
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label: string;
  id?: string;
  tone?: "light" | "dark";
}) {
  const btn =
    tone === "dark"
      ? "bg-white/10 text-paper hover:bg-white/20 disabled:opacity-30"
      : "bg-sand text-ink hover:bg-sand-2 disabled:opacity-30";
  return (
    <div className="inline-flex items-center gap-1" role="group" aria-label={label} id={id}>
      <button type="button" aria-label={`${label} −`} className={`grid h-10 w-10 place-items-center rounded-full text-lg font-bold transition ${btn}`} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
        −
      </button>
      <output aria-live="polite" className="w-9 text-center font-display text-2xl tabular-nums">
        {value}
      </output>
      <button type="button" aria-label={`${label} +`} className={`grid h-10 w-10 place-items-center rounded-full text-lg font-bold transition ${btn}`} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>
        +
      </button>
    </div>
  );
}
