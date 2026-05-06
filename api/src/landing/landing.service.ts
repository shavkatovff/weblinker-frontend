import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, LandingPublication } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { TelegramService, escapeHtml } from "../telegram/telegram.service";

/** Vizitka `name` bilan mos — bir yo‘nalishda ikki sahifa bo‘lmasin */
const RESERVED_SLUGS = new Set([
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
  "landing",
]);

@Injectable()
export class LandingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telegram: TelegramService,
  ) {}

  assertSlugAllowed(slug: string) {
    if (RESERVED_SLUGS.has(slug)) {
      throw new ConflictException("Bu manzil tizim tomonidan band");
    }
  }

  publicationToSiteJson(p: LandingPublication) {
    const trialEndsAt = new Date(p.createdAt);
    trialEndsAt.setDate(trialEndsAt.getDate() + 10);
    trialEndsAt.setHours(23, 59, 59, 999);

    const status =
      p.status === "published"
        ? "published"
        : p.status === "paused"
          ? "paused"
          : "draft";

    return {
      id: p.id,
      slug: p.slug,
      type: "landing" as const,
      templateId: p.templateId,
      status,
      publicationId: p.id,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      trialEndsAt: trialEndsAt.toISOString(),
      content: p.contentJson,
    };
  }

  async getMineOne(id: string, ownerPublicId: string) {
    const p = await this.prisma.landingPublication.findFirst({
      where: { id, ownerPublicId },
    });
    if (!p) {
      throw new NotFoundException("Landing topilmadi");
    }
    return { site: this.publicationToSiteJson(p) };
  }

  async getPublicBySlug(slug: string) {
    const p = await this.prisma.landingPublication.findFirst({
      where: { slug, status: "published" },
    });
    if (!p) return null;
    return { site: this.publicationToSiteJson(p) };
  }

  async upsert(
    ownerPublicId: string,
    ownerUserId: number,
    dto: {
      publicationId?: string;
      slug: string;
      templateId: string;
      status: string;
      content: Record<string, unknown>;
    },
  ) {
    this.assertSlugAllowed(dto.slug);

    const vizExists = await this.prisma.vizitka.findUnique({
      where: { name: dto.slug },
    });
    if (vizExists) {
      throw new ConflictException("Bu manzil vizitka sifatida band");
    }

    const json = dto.content as Prisma.InputJsonValue;

    if (dto.publicationId) {
      const existing = await this.prisma.landingPublication.findFirst({
        where: { id: dto.publicationId, ownerPublicId },
      });
      if (!existing) {
        throw new NotFoundException("Landing topilmadi");
      }
      const other = await this.prisma.landingPublication.findFirst({
        where: {
          slug: dto.slug,
          NOT: { id: dto.publicationId },
        },
      });
      if (other) {
        throw new ConflictException("Bu manzil band");
      }
      const p = await this.prisma.landingPublication.update({
        where: { id: dto.publicationId },
        data: {
          slug: dto.slug,
          templateId: dto.templateId,
          status: dto.status,
          contentJson: json,
        },
      });
      return { site: this.publicationToSiteJson(p) };
    }

    const bySlug = await this.prisma.landingPublication.findUnique({
      where: { slug: dto.slug },
    });
    if (bySlug && bySlug.ownerPublicId !== ownerPublicId) {
      throw new ConflictException("Bu manzil band");
    }

    if (bySlug) {
      const p = await this.prisma.landingPublication.update({
        where: { slug: dto.slug },
        data: {
          templateId: dto.templateId,
          status: dto.status,
          contentJson: json,
        },
      });
      return { site: this.publicationToSiteJson(p) };
    }

    const p = await this.prisma.landingPublication.create({
      data: {
        ownerPublicId,
        slug: dto.slug,
        templateId: dto.templateId,
        status: dto.status,
        contentJson: json,
      },
    });
    return { site: this.publicationToSiteJson(p) };
  }

  async createInquiry(
    slug: string,
    dto: {
      visitorName: string;
      visitorPhone: string;
      visitorTelegram?: string;
      message: string;
    },
  ) {
    const landing = await this.prisma.landingPublication.findFirst({
      where: { slug, status: "published" },
      include: {
        owner: {
          select: {
            id: true,
            telegramId: true,
            number: true,
            fullName: true,
          },
        },
      },
    });

    if (!landing) {
      throw new NotFoundException("Sayt topilmadi yoki nashr etilmagan");
    }

    const row = await this.prisma.landingInquiry.create({
      data: {
        landingId: landing.id,
        ownerUserId: landing.owner.id,
        visitorName: dto.visitorName.trim(),
        visitorPhone: dto.visitorPhone.trim(),
        visitorTelegram: dto.visitorTelegram?.trim() || null,
        message: dto.message.trim(),
      },
    });

    const tg = landing.owner.telegramId?.trim();
    if (tg && /^\d+$/.test(tg)) {
      const un =
        landing.owner.fullName?.trim() ||
        landing.owner.number ||
        "Egasi";
      const tgLine = dto.visitorTelegram?.trim()
        ? `@${escapeHtml(dto.visitorTelegram.trim().replace(/^@/, ""))}`
        : "—";
      const html =
        `<b>Yangi ariza (landing)</b><br/>` +
        `Sayt: <code>${escapeHtml(slug)}</code><br/>` +
        `Egasi: ${escapeHtml(un)}<br/><br/>` +
        `<b>Ism:</b> ${escapeHtml(dto.visitorName.trim())}<br/>` +
        `<b>Telefon:</b> ${escapeHtml(dto.visitorPhone.trim())}<br/>` +
        `<b>Telegram:</b> ${tgLine}<br/>` +
        `<b>Izoh:</b><br/>${escapeHtml(dto.message.trim())}`;
      await this.telegram.sendHtmlMessage(tg, html);
    }

    return { ok: true, id: row.id };
  }
}
