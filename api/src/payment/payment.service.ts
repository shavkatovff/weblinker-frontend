import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { checkCompleteSign, checkPrepareSign } from './click-sign';

function bodyRecord(body: unknown): Record<string, unknown> {
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    return body as Record<string, unknown>;
  }
  return {};
}

/** CLICK body dagi `error` — bo‘lmasa undefined */
function parseClickErrorField(data: Record<string, unknown>): number | undefined {
  if (!('error' in data)) return undefined;
  const v = data.error;
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** CLICK action — `Number(null)` va `Number('')` JS da 0 bo‘lmasligi kerak */
function parseClickAction(data: Record<string, unknown>): number | undefined {
  if (!('action' in data)) return undefined;
  const v = data.action;
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}


@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private secretKey(): string {
    const raw = this.config.get<string | undefined>('CLICK_SECRET_KEY');
    const s = typeof raw === 'string' ? raw.trim() : '';
    if (!s) {
      throw new InternalServerErrorException('CLICK_SECRET_KEY is not set');
    }
    return s;
  }

  /** Butun so'm, kamida 1000 — CLICK API amount ham so'mda (float) */
  private assertAmountSom(som: number): number {
    if (!Number.isFinite(som) || som < 1000) {
      throw new BadRequestException('Noto‘g‘ri summa');
    }
    return Math.floor(som);
  }

  /** CLICK float so'm yuborishi mumkin */
  private sameAmountSom(stored: number, fromClick: number): boolean {
    return Math.abs(stored - fromClick) < 0.01;
  }

  /** Otbozor (horse-backend) kabi: CLICK `service_id` kabinetdagi bilan mos bo‘lsin */
  private clickServiceIdMismatch(
    data: Record<string, unknown>,
  ): { error: number; error_note: string } | null {
    const expectedRaw = this.config.get<string>('CLICK_SERVICE_ID')?.trim();
    const expected = Number(expectedRaw);
    if (!Number.isFinite(expected)) {
      throw new InternalServerErrorException('CLICK_SERVICE_ID is not set');
    }
    const sid = Number(data.service_id);
    if (!Number.isFinite(sid) || sid !== expected) {
      return { error: -2, error_note: 'Incorrect parameter amount' };
    }
    return null;
  }


  async createClickPayment(userId: number, amountSom: number) {
    const amount = this.assertAmountSom(amountSom);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    const serviceIdRaw = this.config.get<string>('CLICK_SERVICE_ID')?.trim();
    const merchantIdRaw = this.config.get<string>('CLICK_MERCHANT_ID')?.trim();
    const merchantUserId = this.config.get<string>('CLICK_MERCHANT_USER_ID')?.trim();
    if (!serviceIdRaw || !merchantIdRaw || !merchantUserId) {
      throw new InternalServerErrorException(
        'CLICK_SERVICE_ID, CLICK_MERCHANT_ID yoki CLICK_MERCHANT_USER_ID sozlanmagan',
      );
    }
    const serviceId = Number(serviceIdRaw);
    const merchantId = Number(merchantIdRaw);
    if (!Number.isFinite(serviceId) || !Number.isFinite(merchantId)) {
      throw new BadRequestException('CLICK_SERVICE_ID yoki CLICK_MERCHANT_ID raqam emas');
    }

    const merchantTransId = `balance_${userId}_${Date.now()}`;

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount,
        merchantTransId,
        status: 'PENDING',
      },
    });

    return {
      paymentId: payment.id,
      merchantTransId: payment.merchantTransId,
      /** checkout.js: summa so'mda (CLICK hujjati MERCHANT_TRANS_AMOUNT) */
      amount: payment.amount,
      amountSom: amount,
      serviceId,
      merchantId,
      merchantUserId,
    };
  }

  async handlePrepare(body: unknown) {
    const data = bodyRecord(body);
    const clickTransId = String(data.click_trans_id ?? '');
    const merchantTransId = String(data.merchant_trans_id ?? '');
    const amount = Number(data.amount);
    const action = parseClickAction(data);

    if (action !== 0) {
      return { error: -3, error_note: 'Action not found' };
    }

    const svcErr = this.clickServiceIdMismatch(data);
    if (svcErr) return svcErr;

    if (!checkPrepareSign(this.secretKey(), data)) {
      return { error: -1, error_note: 'SIGN CHECK FAILED!' };
    }

    const payment = await this.prisma.payment.findUnique({
      where: { merchantTransId },
    });

    if (!payment) {
      return { error: -5, error_note: 'User does not exist' };
    }

    if (payment.status === 'PAID') {
      return { error: -4, error_note: 'Already paid' };
    }

    if (payment.status === 'CANCELLED') {
      return { error: -9, error_note: 'Transaction cancelled' };
    }

    if (!this.sameAmountSom(payment.amount, amount)) {
      return { error: -2, error_note: 'Incorrect parameter amount' };
    }

    if (payment.status === 'PREPARED') {
      return {
        click_trans_id: clickTransId,
        merchant_trans_id: merchantTransId,
        merchant_prepare_id: payment.merchantPrepareId ?? payment.id,
        error: 0,
        error_note: 'Success',
      };
    }

    const prepareErr = parseClickErrorField(data);
    if (prepareErr !== undefined && prepareErr < 0) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'CANCELLED',
          clickTransId,
          clickPaydocId: String(data.click_paydoc_id ?? ''),
        },
      });

      return { error: -9, error_note: 'Transaction cancelled' };
    }

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PREPARED',
        clickTransId,
        clickPaydocId: String(data.click_paydoc_id ?? ''),
        merchantPrepareId: payment.id,
      },
    });

    return {
      click_trans_id: clickTransId,
      merchant_trans_id: merchantTransId,
      merchant_prepare_id: updated.id,
      error: 0,
      error_note: 'Success',
    };
  }

  async handleComplete(body: unknown) {
    const data = bodyRecord(body);
    const clickTransId = String(data.click_trans_id ?? '');
    const merchantTransId = String(data.merchant_trans_id ?? '');
    const merchantPrepareId = Number(data.merchant_prepare_id);
    const amount = Number(data.amount);
    const action = parseClickAction(data);
    const clickError = Number(data.error);

    if (action !== 1) {
      return { error: -3, error_note: 'Action not found' };
    }

    const completeSvcErr = this.clickServiceIdMismatch(data);
    if (completeSvcErr) return completeSvcErr;

    if (!checkCompleteSign(this.secretKey(), data)) {
      return { error: -1, error_note: 'SIGN CHECK FAILED!' };
    }

    const payment = await this.prisma.payment.findUnique({
      where: { merchantTransId },
    });

    if (!payment) {
      return { error: -6, error_note: 'Transaction does not exist' };
    }

    if (payment.status === 'PAID') {
      return {
        click_trans_id: clickTransId,
        merchant_trans_id: merchantTransId,
        merchant_confirm_id: payment.merchantConfirmId ?? payment.id,
        error: -4,
        error_note: 'Already paid',
      };
    }

    if (payment.status === 'CANCELLED') {
      return { error: -9, error_note: 'Transaction cancelled' };
    }

    if (payment.merchantPrepareId !== merchantPrepareId) {
      return { error: -6, error_note: 'Transaction does not exist' };
    }

    if (!this.sameAmountSom(payment.amount, amount)) {
      return { error: -2, error_note: 'Incorrect parameter amount' };
    }

    if (clickError < 0) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'CANCELLED' },
      });

      return { error: -9, error_note: 'Transaction cancelled' };
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const freshPayment = await tx.payment.findUnique({
          where: { id: payment.id },
        });

        if (!freshPayment || freshPayment.status === 'PAID') {
          return freshPayment;
        }

        const incrementSom = new Prisma.Decimal(freshPayment.amount);

        await tx.user.update({
          where: { id: freshPayment.userId },
          data: {
            balance: { increment: incrementSom },
          },
        });

        return tx.payment.update({
          where: { id: freshPayment.id },
          data: {
            status: 'PAID',
            paidAt: new Date(),
            clickTransId,
            clickPaydocId: String(data.click_paydoc_id ?? ''),
            merchantConfirmId: freshPayment.id,
          },
        });
      });

      return {
        click_trans_id: clickTransId,
        merchant_trans_id: merchantTransId,
        merchant_confirm_id: result?.id,
        error: 0,
        error_note: 'Success',
      };
    } catch {
      return { error: -7, error_note: 'Failed to update user' };
    }
  }
}
