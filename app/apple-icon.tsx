import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4eadb" }}>
        <svg width="150" height="150" viewBox="0 0 40 40">
          <path d="M6 38V18a14 14 0 0 1 28 0v20z" fill="#0f2430" />
          <circle cx="20" cy="22" r="7" fill="#eba937" />
          <path d="M8 28c3-2 6-2 9 0s6 2 9 0 5-2 6-1v11H8z" fill="#c0512c" />
          <path d="M8 33c3-2 6-2 9 0s6 2 9 0 5-2 6-1v6H8z" fill="#1d6b74" />
        </svg>
      </div>
    ),
    size,
  );
}
