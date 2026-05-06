import type { VizitkaPackage } from "./vizitka-packages";
import type { PublicPricing } from "./vizitka-pricing";

/** Sinxron fallback — API `landingPricesSom` bilan mos */
export const LANDING_PRICE_SOM = {
  "6": 780_000,
  "12": 1_180_000,
} as const;

function perMonthHint(months: number, totalSom: number): string {
  const per = Math.round(totalSom / months);
  return `≈ ${per.toLocaleString("uz-UZ")} so'm/oy`;
}

export function buildLandingFreePackage(freeDays: number) {
  return {
    id: "free" as const,
    trialDays: freeDays,
    title: "Bepul",
    subtitle: "Sinov — barcha landing imkoniyatlari.",
    priceLabel: "0 so'm",
  } as const;
}

export function buildLandingPackages(pricing: PublicPricing): VizitkaPackage[] {
  const p = pricing.landingPricesSom;
  return [
    {
      id: "p6",
      months: 6,
      priceSom: p["6"],
      title: "6 oy",
      subtitle: "Ko‘pchilik tanlaydi — yumshoq narx va uzoq ishlab turish.",
      hint: perMonthHint(6, p["6"]),
      recommended: true,
    },
    {
      id: "p12",
      months: 12,
      priceSom: p["12"],
      title: "1 yil",
      subtitle: "Eng foydali — bir yillik barqaror obuna.",
      hint: perMonthHint(12, p["12"]),
    },
  ];
}

export function landingPackagePriceByMonths(
  pricing: PublicPricing,
): Record<6 | 12, number> {
  const x = pricing.landingPricesSom;
  return { 6: x["6"], 12: x["12"] };
}
