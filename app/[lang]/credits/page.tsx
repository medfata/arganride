import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { imageCredits } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/credits">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { ...pageMetadata({ locale: lang, path: "/credits", title: `${dict.creditsPage.title} | Aga Taxi`, description: dict.creditsPage.intro }), robots: { index: false, follow: true } };
}

export default async function CreditsPage({ params }: PageProps<"/[lang]/credits">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const c = dict.creditsPage;

  return (
    <div className="container-x py-16 sm:py-24">
      <h1 className="font-display text-5xl sm:text-6xl">{c.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/70">{c.intro}</p>
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(imageCredits).map(([key, credit]) => (
          <li key={key} className="card flex gap-4 p-3">
            <span className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl">
              <Image src={`/images/${key}.webp`} alt="" fill sizes="96px" className="object-cover" />
            </span>
            <div className="min-w-0 text-sm">
              <a href={credit.source} target="_blank" rel="noopener" className="line-clamp-2 font-semibold hover:text-terracotta">
                {credit.title.replace(/\.(jpe?g|png)$/i, "")}
              </a>
              <p className="mt-1 text-ink/70">
                {c.author}: {credit.author}
              </p>
              <p className="text-ink/70">
                {c.license}:{" "}
                {credit.licenseUrl ? (
                  <a href={credit.licenseUrl} target="_blank" rel="noopener license" className="underline">
                    {credit.license}
                  </a>
                ) : (
                  credit.license
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
