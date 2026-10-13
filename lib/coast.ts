// Shared geometry for the hand-drawn Souss coast maps (home page map and booking picker).

// Equirectangular projection tuned to the Souss coast.
export const BOUNDS = { minLng: -10.45, maxLng: -7.75, minLat: 29.15, maxLat: 31.85 };
export const K = 430;
export const COS = Math.cos((30.5 * Math.PI) / 180);
export const W = Math.round((BOUNDS.maxLng - BOUNDS.minLng) * COS * K);
export const H = Math.round((BOUNDS.maxLat - BOUNDS.minLat) * K);
export const px = (lat: number, lng: number) => [(lng - BOUNDS.minLng) * COS * K, (BOUNDS.maxLat - lat) * K] as const;

export const COAST: [number, number][] = [
  [31.85, -9.69], [31.66, -9.68], [31.51, -9.77], [31.4, -9.84], [31.3, -9.8], [31.12, -9.83], [31.02, -9.86],
  [30.9, -9.83], [30.84, -9.83], [30.75, -9.86], [30.64, -9.89], [30.58, -9.8], [30.545, -9.72], [30.51, -9.69],
  [30.49, -9.665], [30.44, -9.65], [30.42, -9.635], [30.39, -9.605], [30.36, -9.6], [30.2, -9.63], [30.05, -9.68],
  [29.9, -9.76], [29.8, -9.84], [29.7, -9.93], [29.58, -10.04], [29.45, -10.12], [29.38, -10.18], [29.15, -10.33],
];

export const coastPath = COAST.map(([la, ln], i) => `${i ? "L" : "M"}${px(la, ln).map((n) => n.toFixed(1)).join(",")}`).join(" ");

// Mountain glyphs for the High Atlas and Anti-Atlas.
export const PEAKS: [number, number][] = [
  [31.05, -8.4], [30.98, -8.75], [30.9, -9.05], [31.15, -8.1], [30.82, -9.3], [31.25, -8.6],
  [29.9, -9.2], [29.8, -8.75], [29.6, -9.4], [29.95, -8.4], [29.55, -8.9],
];
