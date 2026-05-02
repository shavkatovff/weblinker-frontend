import type { PublicPricing } from "./vizitka-pricing";

/** Mijoz vizitka paketlari — summa va muddat (oy) */
export type VizitkaPackageId = "free" | "p3" | "p6" | "p12";

export type VizitkaPackage = {
  id: "p3" | "p6" | "p12";
  months: 3 | 6 | 12;
  priceSom: number;
  title: string;
  subtitle: string;
  hint?: string;
  recommended?: boolean;
};

export function buildVizitkaFreePackage(freeDays: number) {
  return {
    id: "free" as const,
    trialDays: freeDays,
    title: "Bepul",
    subtitle: "Sinov — barcha vizitka imkoniyatlari.",
    priceLabel: "0 so'm",
  } as const;
}

function perMonthHint(months: number, totalSom: number): string {
  const per = Math.round(totalSom / months);
  return `≈ ${per.toLocaleString("uz-UZ")} so'm/oy`;
}

/** `GET /vizitka/pricing` dan kelgan narxlar asosida kartalar */
export function buildVizitkaPackages(pricing: PublicPricing): VizitkaPackage[] {
  const p = pricing.pricesSom;
  return [
    {
      id: "p3",
      months: 3,
      priceSom: p["3"],
      title: "3 oy",
      subtitle: "Qisqa muddat — sinab ko‘rish uchun qulay.",
      hint: perMonthHint(3, p["3"]),
    },
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

export function packagePriceByMonths(pricing: PublicPricing): Record<3 | 6 | 12, number> {
  const x = pricing.pricesSom;
  return { 3: x["3"], 6: x["6"], 12: x["12"] };
}

export function formatSom(n: number): string {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}
