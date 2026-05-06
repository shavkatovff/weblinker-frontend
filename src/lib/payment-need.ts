/**
 * Balans va paket narxi o‘rtasidagi farqni CLICK uchun butun so‘mda hisoblash.
 * Decimal/float xatolarni oldini olish: avval tiyinga (×100), keyin butun so‘m.
 */
export function computeClickTopUpNeedSom(
  packagePriceSom: number,
  balanceSom: number,
): number {
  const priceTiyn = Math.round(Number(packagePriceSom) * 100);
  const balTiyn = Math.round(Number(balanceSom) * 100);
  const gapTiyn = Math.max(0, priceTiyn - balTiyn);
  return Math.ceil(gapTiyn / 100);
}
