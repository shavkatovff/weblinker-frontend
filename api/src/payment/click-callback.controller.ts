import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

/**
 * CLICK merchant kabineti (Prepare / Complete).
 * Production (bir domen): https://weblinker.uz/api/payments/click/prepare
 * va https://weblinker.uz/api/payments/click/complete
 * (Nginx yoki Next rewrites orqali backend 8001 ga proxylanadi)
 *
 * Nest @Post() default 201 — CLICK odatda 200 kutadi; shuningdan "javob yo'q" xatosi bo'lishi mumkin.
 */
@Controller('api/payments/click')
export class ClickCallbackController {
  constructor(private readonly payments: PaymentService) {}

  @Post('prepare')
  @HttpCode(HttpStatus.OK)
  async prepare(@Body() body: unknown) {
    return this.payments.handlePrepare(body);
  }

  @Post('complete')
  @HttpCode(HttpStatus.OK)
  async complete(@Body() body: unknown) {
    return this.payments.handleComplete(body);
  }
}
