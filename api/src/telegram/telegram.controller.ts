import { Body, Controller, Post } from "@nestjs/common";
import { TelegramService } from "./telegram.service";

@Controller("telegram")
export class TelegramController {
  constructor(private readonly tg: TelegramService) {}

  @Post("webhook")
  async webhook(@Body() body: Record<string, unknown>) {
    await this.tg.handleUpdate(
      body as {
        message?: { chat: { id: number }; from?: { id: number; username?: string; first_name?: string }; text?: string; contact?: { phone_number?: string; first_name?: string; last_name?: string } };
        callback_query?: { id: string; from: { id: number }; data?: string; message?: { chat: { id: number }; message_id: number } };
      },
    );
    return { ok: true };
  }
}
