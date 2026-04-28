import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TelegramService } from "./telegram.service";

/**
 * Lokalda Telegram `localhost` ga webhook yubora olmaydi.
 * TELEGRAM_POLLING=true bo'lsa, getUpdates orqali yangiliklar olinadi (webhook talab qilinmaydi).
 * Production + HTTPS: TELEGRAM_POLLING=false va setWebhook qilingan URL.
 */
@Injectable()
export class TelegramPollingService implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(TelegramPollingService.name);
  private run = false;
  private offset = 0;

  constructor(
    private readonly config: ConfigService,
    private readonly tg: TelegramService,
  ) {}

  private token() {
    return this.config.getOrThrow<string>("TELEGRAM_BOT_TOKEN");
  }

  private api(m: string) {
    return `https://api.telegram.org/bot${this.token()}/${m}`;
  }

  private pollingEnabled(): boolean {
    const v = this.config.get<string>("TELEGRAM_POLLING", "true")?.toLowerCase();
    return v === "true" || v === "1" || v === "yes";
  }

  async onModuleInit() {
    if (!this.pollingEnabled()) {
      this.log.log("Telegram long polling o‘chirilgan (TELEGRAM_POLLING≠true). Faqat webhook ishlatiladi.");
      return;
    }
    this.run = true;
    const del = await fetch(this.api("deleteWebhook"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ drop_pending_updates: false }),
    });
    const delBody = (await del.text()) as string;
    if (del.ok) {
      this.log.log("Eski webhook o‘chirildi (getUpdates bilan ishlash uchun).");
    } else {
      this.log.warn(`deleteWebhook: ${del.status} ${delBody}`);
    }
    void this.loop();
  }

  onModuleDestroy() {
    this.run = false;
  }

  private async loop() {
    while (this.run) {
      try {
        const u = new URL(this.api("getUpdates"));
        u.searchParams.set("offset", String(this.offset));
        u.searchParams.set("timeout", "30");
        u.searchParams.set("allowed_updates", JSON.stringify(["message", "callback_query"]));
        const r = await fetch(u.toString(), { method: "GET" });
        const t = (await r.text()) as string;
        let data: { ok: boolean; result?: Array<{ update_id: number; message?: object; callback_query?: object }> };
        try {
          data = JSON.parse(t) as typeof data;
        } catch {
          this.log.warn("getUpdates JSON: noto‘g‘ri");
          await this.sleep(2000);
          continue;
        }
        if (!r.ok || !data.ok) {
          this.log.warn(`getUpdates ${r.status}: ${t.slice(0, 300)}`);
          await this.sleep(2000);
          continue;
        }
        for (const upd of data.result ?? []) {
          this.offset = upd.update_id + 1;
          await this.tg.handleUpdate(
            upd as {
              message?: { chat: { id: number }; from?: { id: number; username?: string; first_name?: string }; text?: string; contact?: { phone_number?: string; first_name?: string; last_name?: string } };
              callback_query?: { id: string; from: { id: number }; data?: string; message?: { chat: { id: number }; message_id: number } };
            },
          );
        }
      } catch (e) {
        this.log.error("Polling: ", e);
        await this.sleep(3000);
      }
    }
  }

  private sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }
}
