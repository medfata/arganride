import Link from "next/link";
import { defaultLocale } from "@/lib/i18n/config";

// not-found.tsx receives no params, so this page stays in English and links to the default locale.
export default function NotFound() {
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-24 text-center">
      <div>
        <p className="font-tifinagh text-2xl tracking-[0.4em] text-terracotta" aria-hidden="true">ⴰⵣⵓⵍ</p>
        <h1 className="mt-4 font-display text-6xl sm:text-7xl">This road leads to the sea.</h1>
        <p className="mx-auto mt-5 max-w-md text-lg text-ink/70">The page you&apos;re looking for doesn&apos;t exist — but your transfer still can.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href={`/${defaultLocale}`} className="btn btn-ghost">
            Home
          </Link>
          <Link href={`/${defaultLocale}/book`} className="btn btn-primary">
            Book a transfer
          </Link>
        </div>
      </div>
    </div>
  );
}
