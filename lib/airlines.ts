/** Airlines that fly (or have flown seasonally) into Agadir–Al Massira (AGA). Used to recognise flight numbers. */
export const airlines: Record<string, { name: string; color: string }> = {
  FR: { name: "Ryanair", color: "#073590" },
  RK: { name: "Ryanair UK", color: "#073590" },
  U2: { name: "easyJet", color: "#FF6600" },
  EC: { name: "easyJet Europe", color: "#FF6600" },
  DS: { name: "easyJet Switzerland", color: "#FF6600" },
  AT: { name: "Royal Air Maroc", color: "#C1272D" },
  "3O": { name: "Air Arabia Maroc", color: "#E31E24" },
  TO: { name: "Transavia France", color: "#00D66C" },
  HV: { name: "Transavia", color: "#00D66C" },
  BY: { name: "TUI Airways", color: "#1A115A" },
  TB: { name: "TUI fly Belgium", color: "#1A115A" },
  X3: { name: "TUI fly", color: "#1A115A" },
  OR: { name: "TUI fly Netherlands", color: "#1A115A" },
  LS: { name: "Jet2.com", color: "#D71920" },
  EW: { name: "Eurowings", color: "#A3055B" },
  DE: { name: "Condor", color: "#F5B700" },
  "4Y": { name: "Discover Airlines", color: "#0A2C5A" },
  NT: { name: "Binter", color: "#00A3E0" },
  W6: { name: "Wizz Air", color: "#C6007E" },
  W4: { name: "Wizz Air Malta", color: "#C6007E" },
  VY: { name: "Vueling", color: "#FFCC00" },
  V7: { name: "Volotea", color: "#E4007C" },
  DY: { name: "Norwegian", color: "#D81939" },
  D8: { name: "Norwegian", color: "#D81939" },
  SK: { name: "SAS", color: "#000B9F" },
  QS: { name: "Smartwings", color: "#003C7E" },
  WK: { name: "Edelweiss", color: "#E2001A" },
  SN: { name: "Brussels Airlines", color: "#002C5F" },
  AF: { name: "Air France", color: "#002157" },
  LH: { name: "Lufthansa", color: "#05164D" },
};

export type ParsedFlight = { code: string; number: string; normalized: string; airline?: string; color?: string };

export function parseFlightNumber(raw: string): ParsedFlight | null {
  const v = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const m = v.match(/^([A-Z][A-Z0-9]|[0-9][A-Z])(\d{1,4}[A-Z]?)$/);
  if (!m) return null;
  const [, code, number] = m;
  const a = airlines[code];
  return { code, number, normalized: `${code} ${number}`, airline: a?.name, color: a?.color };
}
