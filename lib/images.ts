import credits from "./image-credits.json";

export type ImageKey = keyof typeof credits;

export const imageCredits = credits as Record<
  string,
  { title: string; source: string; license: string; licenseUrl?: string | null; author: string; width: number; height: number }
>;

export function img(key: string) {
  const c = imageCredits[key];
  return { src: `/images/${key}.webp`, width: c?.width ?? 1600, height: c?.height ?? 1067 };
}
