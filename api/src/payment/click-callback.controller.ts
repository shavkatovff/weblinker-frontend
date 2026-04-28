import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

/**
 * CLICK merchant kabineti (Prepare / Complete).
 * Production: https://api.weblinker.uz/api/payments/click/prepare
 * va https://api.weblinker.uz/api/payments/click/complete
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
