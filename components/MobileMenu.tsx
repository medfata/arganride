"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { IconWhatsapp } from "./Icons";

export function MobileMenu({
  links,
  labels,
  bookHref,
  whatsappHref,
}: {
  links: { href: string; label: string }[];
  labels: { menu: string; close: string; book: string };
  bookHref: string;
  whatsappHref: string;
}) {
  const pathname = usePathname();
  // Remember the page the menu was opened on, so navigating anywhere closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (next: boolean | ((o: boolean) => boolean)) =>
    setOpenOn((typeof next === "function" ? next(open) : next) ? pathname : null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? labels.close : labels.menu}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-paper"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
        </svg>
      </button>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="fixed inset-x-3 top-[80px] z-50 animate-rise rounded-3xl bg-ink p-3 text-paper shadow-2xl">
          <ul>
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3.5 font-display text-2xl hover:bg-white/5">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Link href={bookHref} onClick={() => setOpen(false)} className="btn btn-primary">
              {labels.book}
            </Link>
            <a href={whatsappHref} target="_blank" rel="noopener" className="btn bg-white/10 text-paper">
              <IconWhatsapp className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </nav>
      )}
    </div>
  );
}
