import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAccessGuard } from '../auth/jwt-access.guard';
import { CreateClickPaymentDto } from './dto/create-click-payment.dto';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly payments: PaymentService) {}

  /** JWT: body faqat { amount } — butun so'm, kamida 1000 */
  @Post('click')
  @UseGuards(JwtAccessGuard)
  async createClick(
    @Req() req: { user: { sub: number } },
    @Body() dto: CreateClickPaymentDto,
  ) {
    return this.payments.createClickPayment(req.user.sub, dto.amount, {
      vizitkaId: dto.vizitkaId,
      subscriptionMonths: dto.subscriptionMonths,
    });
  }
}
