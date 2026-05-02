import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, Vizitka, VizitkaStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AppSettingsService } from "../settings/app-settings.service";
import { CreateVizitkaDto, UpdateVizitkaBodyDto } from "./dto/create-vizitka.dto";
import {
  computeSubscriptionExpiredAt,
  DEFAULT_VIZITKA_FREE_PUBLISH_DAYS,
} from "./subscription";

const RESERVED_NAMES = new Set([
  "dashboard",
  "login",
  "signup",
  "api",
  "admin",
  "static",
  "pricing",
  "terms",
  "privacy",
  "check",
  "health",
  "_next",
  "settings",
  "inbox",
  "billing",
  "sites",
  "new",
  "favicon",
  "robots",
  "sitemap",
  "public",
  "vizitka",
  "m",
  "auth",
  "webhook",
  "telegram",
]);

@Injectable()
export class VizitkaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appSettings: AppSettingsService,
  ) {}

  /**
   * Bepul sinov: `days` kalendar kuni, oxirgi kun 23:59:59 (server TZ).
   * `expired_at` null bo‘lgan eski yozuvlar uchun DEFAULT qabul qilinadi.
   */
  static computeTrialExpiredAt(
    anchor: Date = new Date(),
    days: number = DEFAULT_VIZITKA_FREE_PUBLISH_DAYS,
  ): Date {
    const end = new Date(anchor);
    end.setDate(end.getDate() + days);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  assertNameAllowed(name: string) {
    if (RESERVED_NAMES.has(name)) {
      throw new ConflictException("Bu manzil tizim tomonidan band");
    }
  }

  private toSiteStatus(s: VizitkaStatus): "draft" | "published" | "paused" {
    if (s === "ACTIVE") return "published";
    if (s === "DRAFT") return "draft";
    if (s === "PAUSED" || s === "EXPIRED") return "paused";
    return "draft";
  }

  toPublicSiteJson(v: Vizitka) {
    const businessName = (v.headline && v.headline.trim()) || v.name.replace(/-/g, " ");
    const trialEnds = (
      v.expiredAt ?? VizitkaService.computeTrialExpiredAt(v.createdAt)
    ).toISOString();
    const social: { id: string; network: string; value: string }[] = [];
    const push = (network: string, value: string | null | undefined) => {
      if (!value?.trim()) return;
      social.push({ id: `${network}-${social.length}`, network, value: value.trim() });
    };
    push("instagram", v.instagramLink);
    push("telegram", v.telegramLink);
    push("tiktok", v.tiktokLink);
    push("youtube", v.youtubeLink);
    push("facebook", v.facebookLink);
    push("linkedin", v.linkedinLink);
    push("x", v.xLink);
    push("threads", v.threadsLink);
    push("whatsapp", v.whatsappLink);
    push("website", v.websaytLink);
    const hero = v.photoUrl
      ? {
          dataUrl: v.photoUrl,
          sizeBytes: 0,
          name: v.photoUrl.split("/").pop() || "hero",
        }
      : undefined;
    const logo = v.logoUrl
      ? {
          dataUrl: v.logoUrl,
          sizeBytes: 0,
          name: v.logoUrl.split("/").pop() || "logo",
        }
      : undefined;
    const content = {
      businessName,
      category: v.category?.trim() || "Biznes",
      tagline: v.shortDescription?.trim() || "",
      description: v.description?.trim() || "",
      phone: v.contactNumber?.trim() || "",
      address: v.address?.trim() || "",
      mapsUrl: v.mapLink?.trim() || undefined,
      hoursLine: v.workHour?.trim() || "",
      social,
      accentInitials: String(businessName)
        .replace(/\s+/g, "")
        .slice(0, 2)
        .toUpperCase() || "WL",
      heroImage: hero,
      logoImage: logo,
      colorTheme: (v.colorThemeId as "mono" | "mint") || "mono",
      pattern: (v.patternId as "none" | "dots") || "none",
    };
    const templateId = v.templateId || "card";
    return {
      id: v.id,
      slug: v.name,
      type: "vizitka",
      templateId,
      status: this.toSiteStatus(v.status),
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
      trialEndsAt: trialEnds,
      subscriptionEndsAt: trialEnds,
      content,
    };
  }

  async getPublicByName(name: string) {
    const now = new Date();
    const v = await this.prisma.vizitka.findFirst({
      where: { name },
    });
    if (!v || v.status === "DRAFT") {
      return null;
    }

    const businessName =
      (v.headline && v.headline.trim()) || v.name.replace(/-/g, " ");
    const expiredByDate = v.expiredAt != null && v.expiredAt < now;

    if (v.status === "ACTIVE" && !expiredByDate) {
      return { site: this.toPublicSiteJson(v) };
    }

    if (v.status === "PAUSED") {
      return {
        publicPause: {
          kind: "paused" as const,
          slug: v.name,
          businessName,
        },
      };
    }

    return {
      publicPause: {
        kind: "expired" as const,
        slug: v.name,
        businessName,
      },
    };
  }

  async listMine(ownerPublicId: string) {
    const list = await this.prisma.vizitka.findMany({
      where: { ownerPublicId },
      orderBy: { updatedAt: "desc" },
    });
    return { items: list.map((v) => this.toPublicSiteJson(v)) };
  }

  async create(dto: CreateVizitkaDto, ownerPublicId: string) {
    this.assertNameAllowed(dto.name);
    const exists = await this.prisma.vizitka.findUnique({ where: { name: dto.name } });
    if (exists) {
      throw new ConflictException("Bu manzil (nom) allaqachon olingan");
    }
    const now = new Date();
    const settings = await this.appSettings.get();
    const trialDays = settings.freePublishDays;
    const expiredAt =
      dto.subscriptionMonths != null
        ? computeSubscriptionExpiredAt(dto.subscriptionMonths, now)
        : VizitkaService.computeTrialExpiredAt(now, trialDays);

    const baseData = {
      ownerPublicId,
      name: dto.name,
      expiredAt,
      plan: dto.plan || "vizitka",
      headline: dto.headline,
      category: dto.category,
      photoUrl: dto.photoUrl,
      logoUrl: dto.logoUrl,
      contactNumber: dto.contactNumber,
      address: dto.address,
      workHour: dto.workHour,
      shortDescription: dto.shortDescription,
      description: dto.description,
      templateId: dto.templateId,
      colorThemeId: dto.colorThemeId,
      patternId: dto.patternId,
      status: dto.status || "DRAFT",
      mapLink: dto.mapLink,
      instagramLink: dto.instagramLink,
      telegramLink: dto.telegramLink,
      tiktokLink: dto.tiktokLink,
      youtubeLink: dto.youtubeLink,
      facebookLink: dto.facebookLink,
      linkedinLink: dto.linkedinLink,
      xLink: dto.xLink,
      threadsLink: dto.threadsLink,
      whatsappLink: dto.whatsappLink,
      websaytLink: dto.websaytLink,
    };

    if (dto.subscriptionMonths != null) {
      const priceSom = await this.appSettings.priceSomForMonths(dto.subscriptionMonths);
      const price = new Prisma.Decimal(priceSom);
      const v = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { publicId: ownerPublicId } });
        if (!user) {
          throw new NotFoundException("Foydalanuvchi topilmadi");
        }
        if (user.balance.lt(price)) {
          throw new BadRequestException(
            `Balans yetarli emas. Paket: ${priceSom} so'm. Joriy balans: ${Number(user.balance).toLocaleString("uz-UZ")} so'm.`,
          );
        }
        await tx.user.update({
          where: { id: user.id },
          data: { balance: { decrement: price } },
        });
        return tx.vizitka.create({
          data: baseData,
        });
      });
      return { site: this.toPublicSiteJson(v) };
    }

    const v = await this.prisma.vizitka.create({
      data: baseData,
    });
    return { site: this.toPublicSiteJson(v) };
  }

  async update(id: string, dto: UpdateVizitkaBodyDto, ownerPublicId: string) {
    const v = await this.prisma.vizitka.findFirst({ where: { id, ownerPublicId } });
    if (!v) {
      throw new NotFoundException("Vizitka topilmadi");
    }
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(dto)) {
      if (val === undefined) continue;
      if ((k === "logoUrl" || k === "photoUrl") && val === "") {
        patch[k] = null;
      } else {
        patch[k] = val;
      }
    }
    const u = await this.prisma.vizitka.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: patch as any,
    });
    return { site: this.toPublicSiteJson(u) };
  }

  async remove(id: string, ownerPublicId: string) {
    const r = await this.prisma.vizitka.deleteMany({ where: { id, ownerPublicId } });
    if (r.count === 0) {
      throw new NotFoundException("Vizitka topilmadi");
    }
  }

  async getMineOne(id: string, ownerPublicId: string) {
    const v = await this.prisma.vizitka.findFirst({
      where: { id, ownerPublicId },
    });
    if (!v) {
      throw new NotFoundException("Vizitka topilmadi");
    }
    return { site: this.toPublicSiteJson(v) };
  }

  /** Diskda saqlangan fayl yo‘li DB ga: `/uploads/logos/...` */
  async saveUploadedLogo(id: string, ownerPublicId: string, relativeUrl: string) {
    const existing = await this.prisma.vizitka.findFirst({
      where: { id, ownerPublicId },
    });
    if (!existing) {
      throw new NotFoundException("Vizitka topilmadi");
    }
    const u = await this.prisma.vizitka.update({
      where: { id },
      data: { logoUrl: relativeUrl },
    });
    return { site: this.toPublicSiteJson(u) };
  }

  /** Hero rasm — `/uploads/photos/...` → `photo_url` */
  async saveUploadedPhoto(id: string, ownerPublicId: string, relativeUrl: string) {
    const existing = await this.prisma.vizitka.findFirst({
      where: { id, ownerPublicId },
    });
    if (!existing) {
      throw new NotFoundException("Vizitka topilmadi");
    }
    const u = await this.prisma.vizitka.update({
      where: { id },
      data: { photoUrl: relativeUrl },
    });
    return { site: this.toPublicSiteJson(u) };
  }
}
