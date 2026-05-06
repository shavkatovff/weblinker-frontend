import { apiBaseUrl } from "./api-base";

/** API `GET /vizitka/pricing` javobi — mijoz tomonda narx va bepul kunlar */
export type PublicPricing = {
  freePublishDays: number;
  pricesSom: { "6": number; "12": number };
  landingPricesSom: { "6": number; "12": number };
};

/** Admin PATCH javobi bilan mos (qo‘shimcha maydonlar) */
export type AppSettingsPublic = PublicPricing & {
  updatedAt?: string;
};

/** DB migratsiyasi bilan bir xil fallback (tarmoq yo‘q / birinchi paint) */
export const FALLBACK_PUBLIC_PRICING: PublicPricing = {
  freePublishDays: 10,
  pricesSom: { "6": 75_000, "12": 125_000 },
  landingPricesSom: { "6": 780_000, "12": 1_180_000 },
};

export async function fetchVizitkaPricing(signal?: AbortSignal): Promise<PublicPricing> {
  const base = apiBaseUrl();
  const r = await fetch(`${base}/vizitka/pricing`, {
    signal,
    ...(typeof window === "undefined" ? { next: { revalidate: 30 } } : {}),
  });
  if (!r.ok) return FALLBACK_PUBLIC_PRICING;
  const j = (await r.json()) as Partial<PublicPricing>;
  return {
    ...FALLBACK_PUBLIC_PRICING,
    ...j,
    pricesSom: { ...FALLBACK_PUBLIC_PRICING.pricesSom, ...j.pricesSom },
    landingPricesSom: {
      ...FALLBACK_PUBLIC_PRICING.landingPricesSom,
      ...j.landingPricesSom,
    },
  };
}
