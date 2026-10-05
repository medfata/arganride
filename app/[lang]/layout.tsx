import type { Metadata, Viewport } from "next";
import { Gloock, Figtree, Noto_Sans_Tifinagh } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { site, whatsappLink } from "@/lib/site";
import { businessGraph } from "@/lib/structured-data";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { IconWhatsapp } from "@/components/Icons";

const display = Gloock({ weight: "400", subsets: ["latin", "latin-ext"], variable: "--font-gloock", display: "swap" });
const sans = Figtree({ subsets: ["latin", "latin-ext"], variable: "--font-figtree", display: "swap" });
const tifinagh = Noto_Sans_Tifinagh({
  weight: "400",
  subsets: ["tifinagh"],
  variable: "--font-tifinagh",
  display: "swap",
  preload: false,
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#f4eadb",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    metadataBase: new URL(site.url),
    title: { default: dict.meta.title, template: `%s | ${site.name}` },
    description: dict.meta.description,
    applicationName: site.name,
    category: "travel",
    formatDetection: { telephone: true },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    other: { "geo.region": "MA-SOU", "geo.placename": "Agadir", "geo.position": `${site.geo.lat};${site.geo.lng}`, ICBM: `${site.geo.lat}, ${site.geo.lng}` },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html lang={lang} className={`${display.variable} ${sans.variable} ${tifinagh.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
          Skip to content
        </a>
        <JsonLd data={businessGraph(lang, dict.meta.description)} />
        <Header locale={lang} dict={dict} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer locale={lang} dict={dict} />
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener"
          aria-label={dict.cta.whatsapp}
          className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,.7)] transition hover:scale-105"
        >
          <IconWhatsapp className="h-7 w-7" />
        </a>
      </body>
    </html>
  );
}
