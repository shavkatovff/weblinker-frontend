import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Vizitka, VizitkaStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVizitkaDto, UpdateVizitkaBodyDto } from "./dto/create-vizitka.dto";
import { computeSubscriptionExpiredAt } from "./subscription";

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
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 7 kunlik bepul sinov: yaratilgan sanaga 7 kalendar kuni qo‘shiladi,
   * o‘sha oxirgi kun oxirigacha (server TZ, odatda Asia/Tashkent).
   * Har kecha 24:00 dan keyin qoldiq kun hisobi `trialDaysLeft` da 1 ga kamayadi.
   */
  static computeTrialExpiredAt(anchor: Date = new Date()): Date {
    const end = new Date(anchor);
    end.setDate(end.getDate() + 7);
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
      ? { dataUrl: v.photoUrl, sizeBytes: 0, name: "photo" }
      : undefined;
    const logo = v.logoUrl
      ? { dataUrl: v.logoUrl, sizeBytes: 0, name: "logo" }
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
      where: {
        name,
        status: "ACTIVE",
        OR: [{ expiredAt: null }, { expiredAt: { gt: now } }],
      },
    });
    if (!v) {
      return null;
    }
    return { site: this.toPublicSiteJson(v) };
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
    const expiredAt =
      dto.subscriptionMonths != null
        ? computeSubscriptionExpiredAt(dto.subscriptionMonths, now)
        : VizitkaService.computeTrialExpiredAt(now);
    const v = await this.prisma.vizitka.create({
      data: {
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
      },
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
}
