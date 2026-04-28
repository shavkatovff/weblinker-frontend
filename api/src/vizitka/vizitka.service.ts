import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Vizitka, VizitkaStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVizitkaDto, UpdateVizitkaBodyDto } from "./dto/create-vizitka.dto";

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
    const defaultTrial = new Date();
    defaultTrial.setDate(defaultTrial.getDate() + 7);
    const trialEnds = v.expiredAt ? v.expiredAt.toISOString() : defaultTrial.toISOString();
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
      subscriptionEndsAt: v.expiredAt ? v.expiredAt.toISOString() : undefined,
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

  async listMine(userId: number) {
    const list = await this.prisma.vizitka.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    return { items: list.map((v) => this.toPublicSiteJson(v)) };
  }

  async create(dto: CreateVizitkaDto, userId: number) {
    this.assertNameAllowed(dto.name);
    const exists = await this.prisma.vizitka.findUnique({ where: { name: dto.name } });
    if (exists) {
      throw new ConflictException("Bu manzil (nom) allaqachon olingan");
    }
    const v = await this.prisma.vizitka.create({
      data: {
        userId,
        name: dto.name,
        plan: dto.plan || "vizitka",
        headline: dto.headline,
        category: dto.category,
        photoUrl: dto.photoUrl,
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

  async update(id: string, dto: UpdateVizitkaBodyDto, userId: number) {
    const v = await this.prisma.vizitka.findFirst({ where: { id, userId } });
    if (!v) {
      throw new NotFoundException("Vizitka topilmadi");
    }
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(dto)) {
      if (val !== undefined) patch[k] = val;
    }
    const u = await this.prisma.vizitka.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: patch as any,
    });
    return { site: this.toPublicSiteJson(u) };
  }
}
