import type { LandingRecord } from "./types";

/** Qolgan kunlar; `expiredAt` bo‘lmasa `null`; tugagan bo‘lsa `0` yoki manfiy. */
export function landingDaysLeft(l: LandingRecord): number | null {
  if (!l.expiredAt) return null;
  const ms = new Date(l.expiredAt).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function landingInitials(brandName: string, name: string): string {
  const s = (brandName || name).trim();
  if (!s) return "L";
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0] + parts[1]![0]).toUpperCase().slice(0, 2);
  }
  return s.slice(0, 2).toUpperCase();
}
