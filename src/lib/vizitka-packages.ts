/** Mijoz vizitka paketlari — summa va muddat (oy) */
export type VizitkaPackageId = "p3" | "p6" | "p12";

export type VizitkaPackage = {
  id: VizitkaPackageId;
  months: 3 | 6 | 12;
  priceSom: number;
  title: string;
  subtitle: string;
  /** Qisqa iqtisodiy izoh */
  hint?: string;
  recommended?: boolean;
};

export const VIZITKA_PACKAGES: VizitkaPackage[] = [
  {
    id: "p3",
    months: 3,
    priceSom: 37_000,
    title: "3 oy",
    subtitle: "Qisqa muddat — sinab ko‘rish uchun qulay.",
    hint: "≈ 12 333 so'm/oy",
  },
  {
    id: "p6",
    months: 6,
    priceSom: 57_000,
    title: "6 oy",
    subtitle: "Ko‘pchilik tanlaydi — yumshoq narx va uzoq ishlab turish.",
    hint: "≈ 9 500 so'm/oy",
    recommended: true,
  },
  {
    id: "p12",
    months: 12,
    priceSom: 97_000,
    title: "1 yil",
    subtitle: "Eng foydali — bir yillik barqaror obuna.",
    hint: "≈ 8 083 so'm/oy",
  },
];

export const PACKAGE_PRICE_BY_MONTHS: Record<3 | 6 | 12, number> = {
  3: 37_000,
  6: 57_000,
  12: 97_000,
};

export function formatSom(n: number): string {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}
