import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from '../sms/sms.service';

function publicAppBase(config: ConfigService): string {
  const explicit = config.get<string>('PUBLIC_APP_URL')?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  const fe = config.get<string>('FRONTEND_ORIGIN')?.split(',')[0]?.trim();
  if (fe) return fe.replace(/\/$/, '');
  return 'http://localhost:8000';
}

@Injectable()
export class LandingExpiryNotifierService {
  private readonly log = new Logger(LandingExpiryNotifierService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sms: SmsService,
    private readonly config: ConfigService,
  ) {}

  @Cron('*/5 * * * *')
  async cronTick() {
    const off = this.config
      .get<string>('LANDING_EXPIRY_NOTIFY_ENABLED')
      ?.trim();
    if (off === '0' || off?.toLowerCase() === 'false') return;
    try {
      await this.runOnce();
    } catch (e) {
      this.log.error('runOnce', e);
    }
  }

  async runOnce(): Promise<{
    notified: number;
    skippedNoPhone: number;
    failed: number;
  }> {
    const now = new Date();
    const base = publicAppBase(this.config);

    const candidates = await this.prisma.landing.findMany({
      where: {
        expiredAt: { not: null, lt: now },
        expiryNoticeSentAt: null,
      },
      include: {
        user: { select: { number: true, fullName: true } },
      },
    });

    let notified = 0;
    let skippedNoPhone = 0;
    let failed = 0;

    for (const l of candidates) {
      const slug = l.name;
      const title =
        (l.brandName && l.brandName.trim()) || slug.replace(/-/g, ' ');
      const dashUrl = `${base}/dashboard/sites`;
      const renewUrl = `${base}/dashboard/sites`;

      const phone = l.user.number?.trim();
      if (!phone) {
        await this.prisma.landing.update({
          where: { id: l.id },
          data: { expiryNoticeSentAt: now },
        });
        skippedNoPhone += 1;
        continue;
      }

      const text =
        `Weblinker: "${title}" (${slug}) landing obunasi tugadi. ` +
        `Sayt vaqtincha yopildi. Obunani uzaytirish: ${renewUrl}`;

      const ok = await this.sms.sendText(phone, text);
      if (ok) {
        await this.prisma.landing.update({
          where: { id: l.id },
          data: { expiryNoticeSentAt: now },
        });
        notified += 1;
      } else {
        failed += 1;
        this.log.warn(`Landing SMS yuborilmadi id=${l.id} phone=${phone}`);
      }
    }

    if (notified > 0 || skippedNoPhone > 0 || failed > 0) {
      this.log.log(
        `landing expiry: notified=${notified} noPhone=${skippedNoPhone} failed=${failed}`,
      );
    }

    return { notified, skippedNoPhone, failed };
  }
}
