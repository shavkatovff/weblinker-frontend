import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

/**
 * CLICK merchant kabineti (Prepare / Complete).
 * Production (bir domen): https://weblinker.uz/api/payments/click/prepare
 * va https://weblinker.uz/api/payments/click/complete
 * (Nginx yoki Next rewrites orqali backend 8001 ga proxylanadi)
 */
@Controller('api/payments/click')
export class ClickCallbackController {
  constructor(private readonly payments: PaymentService) {}

  @Post('prepare')
  async prepare(@Body() body: unknown) {
    return this.payments.handlePrepare(body);
  }

  @Post('complete')
  async complete(@Body() body: unknown) {
    return this.payments.handleComplete(body);
  }
}
