import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomInt } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { normalizeUzPhone } from "../common/phone";

const OTP_TTL_MS = 2 * 60 * 1000;
const CALLBACK_REFRESH = "refresh_otp";

export function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** /start, /start@bot, /start payload */
export function isStartCommand(text: string | undefined): boolean {
  if (!text) return false;
  const t = text.trim();
  const first = t.split(/\s/)[0] ?? "";
  if (first === "/start") return true;
  if (first.startsWith("/start@")) return true;
  if (t.startsWith("/start ")) return true;
  return false;
}

@Injectable()
export class TelegramService {
  private readonly log = new Logger(TelegramService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private token() {
    return this.config.getOrThrow<string>("TELEGRAM_BOT_TOKEN");
  }

  private api(method: string) {
    return `https://api.telegram.org/bot${this.token()}/${method}`;
  }

  private makeOtp() {
    return String(100000 + randomInt(900000));
  }

  private expireAt() {
    return new Date(Date.now() + OTP_TTL_MS);
  }

  /** Oddiy matn/HTML — eslatmalar, obuna tugashi va hokazo */
  async sendHtmlMessage(telegramUserId: string, html: string): Promise<boolean> {
    const chatId = String(telegramUserId).trim();
    if (!chatId || !/^\d+$/.test(chatId)) {
      this.log.warn(`sendHtmlMessage: noto‘g‘ri chat_id ${telegramUserId}`);
      return false;
    }
    const data = await this.callJson<{ ok?: boolean }>("sendMessage", {
      chat_id: chatId,
      text: html,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
    return data?.ok === true;
  }

  private async callJson<T = unknown>(method: string, body: object): Promise<T> {
    const r = await fetch(this.api(method), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const t = (await r.text()) as string;
    if (!r.ok) {
      this.log.warn(`Telegram ${method} ${r.status} ${t}`);
    }
    try {
      return JSON.parse(t) as T;
    } catch {
      return {} as T;
    }
  }

  private async setOtpForExistingUser(phone: string, tgId: string) {
    const u = await this.prisma.user.findUnique({ where: { number: phone } });
    if (!u) {
      this.log.error("setOtpForExistingUser: no user for phone");
      return;
    }
    const code = this.makeOtp();
    const ex = this.expireAt();
    await this.prisma.user.update({
      where: { id: u.id },
      data: { loginOtp: code, loginOtpExpiresAt: ex, telegramId: u.telegramId ?? tgId },
    });
    return code;
  }

  private async setOtpForTgUser(phone: string, tgId: string, fullName: string | null, username: string | null) {
    const code = this.makeOtp();
    const ex = this.expireAt();
    await this.prisma.tgUser.upsert({
      where: { telegramUserId: tgId },
      create: {
        telegramUserId: tgId,
        number: phone,
        fullName: fullName,
        username: username,
        loginOtp: code,
        loginOtpExpiresAt: ex,
      },
      update: {
        number: phone,
        fullName: fullName ?? undefined,
        username: username ?? undefined,
        loginOtp: code,
        loginOtpExpiresAt: ex,
      },
    });
    return code;
  }

  private inlineKeyboardWithCopy(code: string) {
    return {
      inline_keyboard: [
        [
          {
            text: "📋 Kodni nusxalash",
            copy_text: { text: code },
          },
        ],
        [
          {
            text: "Kodni yangilash",
            callback_data: CALLBACK_REFRESH,
          },
        ],
      ],
    };
  }

  private otpMessageHtml(isExisting: boolean, code: string) {
    const t = isExisting
      ? "Kirish kodingiz (saytga kiriting):"
      : "Ro'yxatdan o'tish kodingiz (saytga kiriting):";
    return (
      `🔐 <b>${escapeHtml(t)}</b>\n\n` +
      `<code>${escapeHtml(code)}</code>\n\n` +
      "Kod 2 daqiqagacha amal qiladi. " +
      "Pastdagi <b>«Kodni nusxalash»</b> yoki kodni bosib, " +
      "nusxalang."
    );
  }

  private async sendCodeToChatFixed(chatId: number, code: string, isExisting: boolean) {
    return this.callJson("sendMessage", {
      chat_id: chatId,
      text: this.otpMessageHtml(isExisting, code),
      parse_mode: "HTML",
      reply_markup: this.inlineKeyboardWithCopy(code),
    });
  }

  private async onStartMessage(chatId: number) {
    return this.callJson("sendMessage", {
      chat_id: chatId,
      text: "Iltimos, ro'yxatdan o'tish uchun **Kontaktni ulash** tugmasini bosing.",
      parse_mode: "Markdown",
      reply_markup: {
        keyboard: [
          [
            {
              text: "📱 Kontaktni ulash",
              request_contact: true,
            },
          ],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  }

  private async onContactMessage(msg: {
    chat: { id: number };
    from?: { id: number; username?: string; first_name?: string };
    contact?: { phone_number?: string; first_name?: string; last_name?: string };
  }) {
    const contact = msg.contact;
    if (!contact?.phone_number) return;
    const raw = String(contact.phone_number);
    const phone = normalizeUzPhone(raw);
    const chatId = msg.chat.id;
    const fromId = String(msg.from?.id ?? 0);
    if (!fromId) return;
    const fullName =
      [contact.first_name, contact.last_name].filter(Boolean).join(" ") ||
      msg.from?.first_name ||
      null;
    const existing = await this.prisma.user.findUnique({ where: { number: phone } });
    if (existing) {
      const code = await this.setOtpForExistingUser(phone, fromId);
      if (code) await this.sendCodeToChatFixed(chatId, code, true);
      return;
    }
    const code = await this.setOtpForTgUser(phone, fromId, fullName, msg.from?.username ?? null);
    if (code) await this.sendCodeToChatFixed(chatId, code, false);
  }

  private async onRefreshCallback(
    data: { id: string; from: { id: number }; message?: { chat: { id: number }; message_id: number } },
  ) {
    const fromId = String(data.from.id);
    const u = await this.prisma.user.findFirst({ where: { telegramId: fromId } });
    const tgu = u ? null : await this.prisma.tgUser.findUnique({ where: { telegramUserId: fromId } });
    const code = this.makeOtp();
    const ex = this.expireAt();
    if (u) {
      await this.prisma.user.update({
        where: { id: u.id },
        data: { loginOtp: code, loginOtpExpiresAt: ex },
      });
    } else if (tgu) {
      await this.prisma.tgUser.update({
        where: { id: tgu.id },
        data: { loginOtp: code, loginOtpExpiresAt: ex },
      });
    } else {
      await this.callJson("answerCallbackQuery", {
        callback_query_id: data.id,
        text: "Kontaktni qayta ulashing: /start",
        show_alert: true,
      });
      return;
    }
    if (data.message) {
      const text = `🔐 <b>Yangi kod</b>\n\n<code>${escapeHtml(code)}</code>\n\n2 daqiqagacha amal qiladi. Pastdagi <b>«Kodni nusxalash»</b> yordamida oling.`;
      await this.callJson("editMessageText", {
        chat_id: data.message.chat.id,
        message_id: data.message.message_id,
        text,
        parse_mode: "HTML",
        reply_markup: this.inlineKeyboardWithCopy(code),
      });
    }
    await this.callJson("answerCallbackQuery", { callback_query_id: data.id });
  }

  async handleUpdate(raw: {
    message?: { chat: { id: number }; from?: { id: number; username?: string; first_name?: string }; text?: string; contact?: { phone_number?: string; first_name?: string; last_name?: string } };
    callback_query?: { id: string; from: { id: number }; data?: string; message?: { chat: { id: number }; message_id: number } };
  }) {
    if (raw.callback_query && raw.callback_query.data === CALLBACK_REFRESH) {
      return this.onRefreshCallback(raw.callback_query);
    }
    if (raw.message?.contact) {
      return this.onContactMessage(
        raw.message as Parameters<TelegramService["onContactMessage"]>[0],
      );
    }
    if (isStartCommand(raw.message?.text)) {
      return this.onStartMessage(raw.message!.chat.id);
    }
  }
}
