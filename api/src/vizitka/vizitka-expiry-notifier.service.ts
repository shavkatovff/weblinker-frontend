import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron } from "@nestjs/schedule";
import { VizitkaStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { TelegramService, escapeHtml } from "../telegram/telegram.service";

function publicAppBase(config: ConfigService): string {
  const explicit = config.get<string>("PUBLIC_APP_URL")?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const fe = config.get<string>("FRONTEND_ORIGIN")?.split(",")[0]?.trim();
  if (fe) return fe.replace(/\/$/, "");
  return "http://localhost:8000";
}

@Injectable()
export class VizitkaExpiryNotifierService {
  private readonly log = new Logger(VizitkaExpiryNotifierService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegram: TelegramService,
    private readonly config: ConfigService,
  ) {}

  /** Har 5 daqiqada: muddati o‘tgan aktiv vizitkalarni pausaga o‘tkazadi va Telegram xabar yuboradi */
  @Cron("*/5 * * * *")
  async cronTick() {
    const off = this.config.get<string>("VIZITKA_EXPIRY_NOTIFY_ENABLED")?.trim();
    if (off === "0" || off?.toLowerCase() === "false") return;
    try {
      await this.runOnce();
    } catch (e) {
      this.log.error("runOnce", e);
    }
  }

  /** Test / manual chaqirish */
  async runOnce(): Promise<{ paused: number; notified: number; skippedNoTg: number; failed: number }> {
    const now = new Date();
    const base = publicAppBase(this.config);

    const paused = await this.prisma.vizitka.updateMany({
      where: {
        status: VizitkaStatus.ACTIVE,
        expiredAt: { not: null, lt: now },
      },
      data: { status: VizitkaStatus.PAUSED },
    });

    const candidates = await this.prisma.vizitka.findMany({
      where: {
        status: { not: VizitkaStatus.DRAFT },
        expiredAt: { not: null, lt: now },
        expiryNoticeSentAt: null,
      },
      include: {
        user: { select: { telegramId: true, fullName: true } },
      },
    });

    let notified = 0;
    let skippedNoTg = 0;
    let failed = 0;

    for (const v of candidates) {
      const slug = v.name;
      const title =
        (v.headline && v.headline.trim()) || slug.replace(/-/g, " ");
      const dashUrl = `${base}/dashboard/sites/${v.id}`;

      const tg = v.user.telegramId?.trim();
      if (!tg) {
        await this.prisma.vizitka.update({
          where: { id: v.id },
          data: { expiryNoticeSentAt: now },
        });
        skippedNoTg += 1;
        continue;
      }

      const html =
        `⚠️ <b>Obuna muddati tugadi</b>\n\n` +
        `<b>${escapeHtml(title)}</b> (${escapeHtml(slug)}) manzilli vizitka saytingiz muddati tugadi va ` +
        `<b>pausa</b> holatiga o‘tdi.\n\n` +
        `Saytga kiring va paket sotib oling — vizitka yana ochiladi.\n\n` +
        `👉 <a href="${escapeHtml(dashUrl)}">Boshqaruv — obunani uzaytirish</a>`;

      const ok = await this.telegram.sendHtmlMessage(tg, html);
      if (ok) {
        await this.prisma.vizitka.update({
          where: { id: v.id },
          data: { expiryNoticeSentAt: now },
        });
        notified += 1;
      } else {
        failed += 1;
        this.log.warn(`Telegram yuborilmadi vizitka=${v.id} tg=${tg}`);
      }
    }

    if (paused.count > 0 || notified > 0 || skippedNoTg > 0 || failed > 0) {
      this.log.log(
        `expiry job: paused=${paused.count} notified=${notified} noTg=${skippedNoTg} failed=${failed}`,
      );
    }

    return {
      paused: paused.count,
      notified,
      skippedNoTg,
      failed,
    };
  }
}
