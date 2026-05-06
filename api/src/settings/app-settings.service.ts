import { Injectable } from "@nestjs/common";
import { AppSettings } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

/** DB bo‘sh bo‘lsa bir marta yoziladi */
const SEED: Omit<AppSettings, "updatedAt"> = {
  id: 1,
  freePublishDays: 10,
  paket3Som: 37_000,
  paket6Som: 75_000,
  paket12Som: 125_000,
};

export type PublicPricingDto = {
  freePublishDays: number;
  pricesSom: { "6": number; "12": number };
};

@Injectable()
export class AppSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<AppSettings> {
    const row = await this.prisma.appSettings.findUnique({ where: { id: 1 } });
    if (row) return row;
    return this.prisma.appSettings.create({
      data: SEED,
    });
  }

  async getPublicPricing(): Promise<PublicPricingDto> {
    const r = await this.get();
    return {
      freePublishDays: r.freePublishDays,
      pricesSom: {
        "6": r.paket6Som,
        "12": r.paket12Som,
      },
    };
  }

  /** Yangi obuna — faqat 6 va 12 oy */
  async priceSomForMonths(months: 6 | 12): Promise<number> {
    const r = await this.get();
    if (months === 6) return r.paket6Som;
    return r.paket12Som;
  }

  /** CLICK complete: eski `merchant_trans_id` da 3 oy bo‘lishi mumkin */
  async priceSomForMonthsLegacy(months: 3 | 6 | 12): Promise<number> {
    const r = await this.get();
    if (months === 3) return r.paket3Som;
    if (months === 6) return r.paket6Som;
    return r.paket12Som;
  }

  async update(patch: {
    freePublishDays?: number;
    paket6Som?: number;
    paket12Som?: number;
  }): Promise<AppSettings> {
    await this.get();
    return this.prisma.appSettings.update({
      where: { id: 1 },
      data: {
        ...(patch.freePublishDays != null && {
          freePublishDays: patch.freePublishDays,
        }),
        ...(patch.paket6Som != null && { paket6Som: patch.paket6Som }),
        ...(patch.paket12Som != null && { paket12Som: patch.paket12Som }),
      },
    });
  }
}
