import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

const font = () => readFile(join(process.cwd(), "assets/fonts/Gloock-Regular.ttf"));
const photo = async (key: string) => {
  const buf = await readFile(join(process.cwd(), "assets/og", `${key}.jpg`));
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
};

/** Shared social card: photo, brand mark, headline, and an optional price pill. */
export async function ogCard({ image, kicker, title, pill }: { image: string; kicker: string; title: string; pill?: string }) {
  const [gloock, bg] = await Promise.all([font(), photo(image)]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0f2430" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bg} width={1200} height={630} alt="" style={{ position: "absolute", inset: 0, objectFit: "cover" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: "linear-gradient(90deg, rgba(15,36,48,.94) 0%, rgba(15,36,48,.72) 48%, rgba(15,36,48,.1) 100%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 64px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width="56" height="56" viewBox="0 0 40 40">
              <path d="M6 38V18a14 14 0 0 1 28 0v20z" fill="#fbf6ee" />
              <circle cx="20" cy="22" r="7" fill="#eba937" />
              <path d="M8 28c3-2 6-2 9 0s6 2 9 0 5-2 6-1v11H8z" fill="#c0512c" />
              <path d="M8 33c3-2 6-2 9 0s6 2 9 0 5-2 6-1v6H8z" fill="#1d6b74" />
            </svg>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: "Gloock", fontSize: 36, color: "#fbf6ee", lineHeight: 1 }}>Aga Taxi</span>
              <span style={{ fontSize: 15, letterSpacing: 5, color: "#eba937", marginTop: 6 }}>AGADIR AIRPORT · AGA</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 820 }}>
            <span style={{ fontSize: 24, letterSpacing: 4, color: "#eba937", textTransform: "uppercase" }}>{kicker}</span>
            <span style={{ fontFamily: "Gloock", fontSize: title.length > 34 ? 70 : 86, color: "#fbf6ee", lineHeight: 1.02, marginTop: 14 }}>{title}</span>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            {pill && (
              <span style={{ background: "#c0512c", color: "white", fontSize: 30, padding: "12px 26px", borderRadius: 999, fontFamily: "Gloock" }}>{pill}</span>
            )}
            <span style={{ color: "rgba(251,246,238,.85)", fontSize: 24 }}>Meet & greet · Flight tracking · 2 bags free / passenger</span>
          </div>
        </div>
      </div>
    ),
    { ...ogSize, fonts: [{ name: "Gloock", data: gloock, style: "normal", weight: 400 }] },
  );
}
