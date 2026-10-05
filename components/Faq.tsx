export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-ink/10 border-y border-ink/10">
      {items.map((it, i) => (
        <details key={i} className="group py-1" name="faq">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
            <h3 className="text-lg font-semibold leading-snug sm:text-xl">{it.q}</h3>
            <span aria-hidden="true" className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/20 transition group-open:rotate-45 group-open:border-terracotta group-open:bg-terracotta group-open:text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
            </span>
          </summary>
          <p className="max-w-3xl pb-6 pr-12 leading-relaxed text-ink/75">{it.a}</p>
        </details>
      ))}
    </div>
  );
}
