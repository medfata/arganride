"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { locales, localeMeta, type Locale } from "@/lib/i18n/config";

export function LocaleSwitcher({ locale, label, tone = "dark" }: { locale: Locale; label: string; tone?: "dark" | "light" }) {
  const pathname = usePathname() || `/${locale}`;
  const rest = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");
  const ref = useRef<HTMLDetailsElement>(null);

  return (
    <details ref={ref} className="group relative">
      <summary
        aria-label={label}
        className={`flex cursor-pointer list-none items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition [&::-webkit-details-marker]:hidden ${
          tone === "light" ? "text-paper hover:bg-white/10" : "text-ink hover:bg-ink/5"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
        </svg>
        {localeMeta[locale].short}
      </summary>
      <ul className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-2xl border border-ink/10 bg-paper p-1.5 shadow-xl">
        {locales.map((l) => (
          <li key={l}>
            <Link
              href={`/${l}${rest}`}
              hrefLang={localeMeta[l].hreflang}
              onClick={() => ref.current?.removeAttribute("open")}
              aria-current={l === locale ? "true" : undefined}
              className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-ink hover:bg-sand aria-[current]:font-bold"
            >
              {localeMeta[l].label}
              <span className="text-xs text-muted">{localeMeta[l].short}</span>
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
