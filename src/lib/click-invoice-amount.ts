/**
 * Billing `/dashboard/billing` (ClickTopUpPanel) bilan bir xil:
 * CLICK invoice summasi — `Math.floor` butun so'm.
 *
 * @see `src/components/dashboard/click-top-up.tsx` — `Math.floor(amountSom)`
 */
export function clickInvoiceAmountSom(som: number): number {
  return Math.floor(Number(som));
}

/**
 * Paket narxi va balans o‘rtasidagi **yetishmayotgan** qism (CLICK ga shu yuboriladi).
 * Tiyin (×100) da ayirish — float xatolardan qochish.
 * Natija billing bilan mos: butun so'm, `Math.floor`.
 */
export function computeClickTopUpNeedSom(
  packagePriceSom: number,
  balanceSom: number,
): number {
  const priceTiyn = Math.round(Number(packagePriceSom) * 100);
  const balTiyn = Math.round(Number(balanceSom) * 100);
  const gapTiyn = Math.max(0, priceTiyn - balTiyn);
  return Math.floor(gapTiyn / 100);
}
