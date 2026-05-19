import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly log = new Logger(SmsService.name);
  private tokenCache: { token: string; until: number } | null = null;

  constructor(private readonly config: ConfigService) {}

  /** +998901234567 format */
  normalizeUzPhone(raw: string): string | null {
    const d = raw.replace(/\D/g, '');
    if (d.length === 12 && d.startsWith('998')) return `+${d}`;
    if (d.length === 9) return `+998${d}`;
    return null;
  }

  async sendText(phone: string, message: string): Promise<boolean> {
    const to = this.normalizeUzPhone(phone);
    if (!to) {
      this.log.warn(`SMS: noto'g'ri raqam ${phone}`);
      return false;
    }

    const directToken = this.config.get<string>('ESKIZ_TOKEN')?.trim();
    const from = this.config.get<string>('ESKIZ_FROM')?.trim() || '4546';

    try {
      const token =
        directToken || (await this.loginEskiz());
      if (!token) {
        this.log.warn('SMS: ESKIZ_TOKEN yoki login mavjud emas — xabar yuborilmadi');
        return false;
      }

      const res = await fetch('https://notify.eskiz.uz/api/message/sms/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile_phone: to.replace('+', ''),
          message,
          from,
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        this.log.warn(`SMS yuborilmadi: HTTP ${res.status} ${t.slice(0, 200)}`);
        return false;
      }
      return true;
    } catch (e) {
      this.log.warn('SMS xato', e);
      return false;
    }
  }

  private async loginEskiz(): Promise<string | null> {
    const now = Date.now();
    if (this.tokenCache && this.tokenCache.until > now) {
      return this.tokenCache.token;
    }
    const email = this.config.get<string>('ESKIZ_EMAIL')?.trim();
    const password = this.config.get<string>('ESKIZ_PASSWORD')?.trim();
    if (!email || !password) return null;

    const res = await fetch('https://notify.eskiz.uz/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { token?: string } };
    const token = json.data?.token?.trim();
    if (!token) return null;
    this.tokenCache = { token, until: now + 23 * 60 * 60 * 1000 };
    return token;
  }
}
