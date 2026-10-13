import type { VehicleId } from "@/lib/pricing";

/** Flat side-view illustrations so the fleet reads at a glance. */
export function Vehicle({ id, className = "w-full" }: { id: VehicleId; className?: string }) {
  const body = "#fbf6ee";
  const stroke = "#17251c";
  return (
    <svg viewBox="0 0 220 90" className={className} aria-hidden="true">
      <ellipse cx="110" cy="82" rx="96" ry="5" fill="#17251c" opacity=".12" />
      {id === "car" && (
        <g stroke={stroke} strokeWidth="2.5" strokeLinejoin="round">
          <path d="M22 66V54c0-5 3-8 9-9l22-4 20-15c4-3 8-4 13-4h44c6 0 10 2 14 6l17 17 23 4c5 1 8 4 8 9v8z" fill={body} />
          <path d="M80 30h30v16H62zM118 30h26c3 0 5 1 7 3l13 13h-46z" fill="#5d9a63" opacity=".85" />
          <path d="M28 56h14M178 56h14" stroke="#2f6a43" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
      {id === "van" && (
        <g stroke={stroke} strokeWidth="2.5" strokeLinejoin="round">
          <path d="M14 68V24c0-6 4-10 10-10h120c6 0 10 2 13 6l22 26 26 5c5 1 8 5 8 10v7z" fill={body} />
          <path d="M26 24h34v20H26zM68 24h34v20H68zM110 24h30c4 0 6 1 8 3l17 17h-55z" fill="#5d9a63" opacity=".85" />
          <path d="M14 54h195" stroke="#2f6a43" strokeWidth="4" />
        </g>
      )}
      {id === "minibus" && (
        <g stroke={stroke} strokeWidth="2.5" strokeLinejoin="round">
          <path d="M8 68V18c0-5 4-9 9-9h150c5 0 8 2 11 5l18 26 10 4c4 2 6 5 6 9v15z" fill={body} />
          <path d="M18 18h28v20H18zM52 18h28v20H52zM86 18h28v20H86zM120 18h28v20h-28zM154 18h12c3 0 5 1 7 3l12 17h-31z" fill="#5d9a63" opacity=".85" />
          <path d="M8 50h204" stroke="#2f6a43" strokeWidth="4" />
        </g>
      )}
      {(id === "car" ? [56, 166] : id === "van" ? [50, 172] : [42, 178]).map((x) => (
        <g key={x}>
          <circle cx={x} cy="68" r="13" fill={stroke} />
          <circle cx={x} cy="68" r="5.5" fill="#e9d9c1" />
        </g>
      ))}
    </svg>
  );
}
