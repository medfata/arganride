import Image from "next/image";
import { HeroSlideCycler } from "./HeroSlideCycler";

export type HeroSlide = {
  src: string;
  /** The place in the photo, and the trip there from the airport. */
  place: string;
  trip: string;
  /** object-position classes: phones show a portrait band, desktop a wide frame. */
  position: string;
};

const ROOT_ID = "hero-slides";

// The page is static, so the opening slide is drawn at random in the browser. This runs as the
// first child of the slide wrapper, before any slide is parsed, so the wrong photo is never laid out.
const pickStart = (n: number) => `document.currentScript.parentElement.dataset.start=Math.floor(Math.random()*${n})`;

// Until the cycler takes over (data-live), show the drawn slide and display the next one so it preloads.
// Without JavaScript, the first slide shows.
function startRules(n: number) {
  const root = `#${ROOT_ID}`;
  const rules = [`${root}:not([data-start])>.hero-slide:first-of-type{display:block;opacity:1}`];
  for (let i = 0; i < n; i++) {
    const at = (k: number) => `${root}[data-start="${i}"]:not([data-live])>.hero-slide:nth-of-type(${k + 1})`;
    rules.push(`${at(i)}{display:block;opacity:1;z-index:1}`, `${at((i + 1) % n)}{display:block}`);
  }
  return rules.join("");
}

/**
 * Cross-fading background photographs for the hero. Slide visibility lives in a data-state attribute
 * driven by CSS (see .hero-slide in globals.css): only the active, upcoming and outgoing slides are
 * displayed, so lazy loading keeps the rest from downloading until their turn.
 */
export function HeroSlides({ slides }: { slides: HeroSlide[] }) {
  return (
    <div
      id={ROOT_ID}
      aria-hidden="true"
      suppressHydrationWarning
      className="hero-parallax absolute inset-x-0 bottom-0 -z-20 h-[30rem] overflow-hidden sm:h-[36rem] lg:-bottom-[6%] lg:-top-[6%] lg:h-auto"
    >
      <script dangerouslySetInnerHTML={{ __html: pickStart(slides.length) }} />
      <style>{startRules(slides.length)}</style>
      {slides.map((s) => (
        <div key={s.src} className="hero-slide">
          <Image src={s.src} alt="" fill loading="lazy" sizes="100vw" className={`object-cover ${s.position}`} />
          <p className="absolute bottom-16 left-3 z-20 rounded-2xl bg-ink/55 px-3.5 py-2 text-paper backdrop-blur-md sm:left-5 lg:bottom-[calc(6%+5.5rem)] lg:left-auto lg:right-8 lg:text-right">
            <span className="block text-sm font-semibold">{s.place}</span>
            <span className="block text-xs text-paper/75">{s.trip}</span>
          </p>
        </div>
      ))}
      <div className="absolute inset-x-0 top-0 z-10 h-3/5 bg-gradient-to-b from-sand via-sand/70 to-transparent lg:hidden" />
      <HeroSlideCycler rootId={ROOT_ID} />
    </div>
  );
}
