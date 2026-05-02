/** `expired_at` null bo‘lsa `toPublicSiteJson` fallback — DB default bilan mos */
export const DEFAULT_VIZITKA_FREE_PUBLISH_DAYS = 10;

export function computeSubscriptionExpiredAt(months: 3 | 6 | 12, anchor: Date): Date {
  const end = new Date(anchor);
  end.setMonth(end.getMonth() + months);
  end.setHours(23, 59, 59, 999);
  return end;
}

/** Joriy tugashdan yoki hozirdan keyingi muddatga qo'shadi */
export function extendSubscriptionExpiry(
  current: Date | null,
  months: 3 | 6 | 12,
  now: Date,
): Date {
  const base = current && current > now ? current : now;
  const end = new Date(base);
  end.setMonth(end.getMonth() + months);
  end.setHours(23, 59, 59, 999);
  return end;
}

/** CLICK `merchant_trans_id`: `vxt|{vizitkaId}|{months}|{userId}|{random}` */
const VIZITKA_SUB_MERCHANT =
  /^vxt\|([^|]+)\|(3|6|12)\|(\d+)\|([a-z0-9]{8,64})$/;

export function parseVizitkaSubscriptionMerchantId(id: string): {
  vizitkaId: string;
  months: 3 | 6 | 12;
  userId: number;
} | null {
  const m = id.match(VIZITKA_SUB_MERCHANT);
  if (!m) return null;
  return {
    vizitkaId: m[1],
    months: Number(m[2]) as 3 | 6 | 12,
    userId: Number(m[3]),
  };
}
