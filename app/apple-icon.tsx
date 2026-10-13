import { ImageResponse } from "next/og";
import { markShapes } from "@/components/Logo";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f6f0e5" }}>
        <svg width="150" height="150" viewBox="0 0 40 40">
          {markShapes("#17251c")}
        </svg>
      </div>
    ),
    size,
  );
}
