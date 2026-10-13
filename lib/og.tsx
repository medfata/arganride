import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { markShapes } from "@/components/Logo";

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
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#17251c" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bg} width={1200} height={630} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background: "linear-gradient(90deg, rgba(23,37,28,.94) 0%, rgba(23,37,28,.7) 48%, rgba(23,37,28,.05) 100%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 64px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width="56" height="56" viewBox="0 0 40 40">
              {markShapes("#17251c")}
            </svg>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: "Gloock", fontSize: 36, color: "#fbf6ee", lineHeight: 1 }}>Argan Ride</span>
              <span style={{ fontSize: 15, letterSpacing: 5, color: "#dea03a", marginTop: 6 }}>AGADIR · MOROCCO TRANSFERS</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 820 }}>
            <span style={{ fontSize: 24, letterSpacing: 4, color: "#dea03a", textTransform: "uppercase" }}>{kicker}</span>
            <span style={{ fontFamily: "Gloock", fontSize: title.length > 34 ? 70 : 86, color: "#fbf6ee", lineHeight: 1.02, marginTop: 14 }}>{title}</span>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            {pill && (
              <span style={{ background: "#2f6a43", color: "white", fontSize: 30, padding: "12px 26px", borderRadius: 999, fontFamily: "Gloock" }}>{pill}</span>
            )}
            <span style={{ color: "rgba(251,246,238,.85)", fontSize: 24 }}>Meet & greet · Flight tracking · 2 bags free / passenger</span>
          </div>
        </div>
      </div>
    ),
    { ...ogSize, fonts: [{ name: "Gloock", data: gloock, style: "normal", weight: 400 }] },
  );
}
