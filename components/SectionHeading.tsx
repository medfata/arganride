export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  tone = "dark",
  align = "left",
  as: As = "h2",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  tone?: "dark" | "light";
  align?: "left" | "center";
  as?: "h1" | "h2";
}) {
  return (
    <div className={`reveal max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && <p className={`eyebrow ${tone === "light" ? "!text-saffron" : ""}`}>{eyebrow}</p>}
      <As className={`mt-4 text-balance font-display text-4xl leading-[1.04] tracking-tight sm:text-5xl lg:text-[3.6rem] ${tone === "light" ? "text-paper" : "text-ink"}`}>
        {title}
      </As>
      {subtitle && <p className={`mt-5 text-pretty text-lg leading-relaxed ${tone === "light" ? "text-paper/70" : "text-ink/70"}`}>{subtitle}</p>}
    </div>
  );
}
