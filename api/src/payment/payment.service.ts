import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  extendSubscriptionExpiry,
  parseVizitkaSubscriptionMerchantId,
  VIZITKA_SUBSCRIPTION_PRICE_SOM,
} from '../vizitka/subscription';
import { checkCompleteSign, checkPrepareSign } from './click-sign';

const MERCHANT_ALNUM = 'abcdefghijklmnopqrstuvwxyz0123456789';

/** CLICK uchun noyob, bashorat qilinmaydigan `merchant_trans_id` */
function newRandomMerchantTransId(length = 22): string {
  const buf = randomBytes(length);
  let s = '';
  for (let i = 0; i < length; i++) {
    s += MERCHANT_ALNUM[buf[i]! % MERCHANT_ALNUM.length]!;
  }
  return s;
}

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


  async createClickPayment(
    userId: number,
    amountSom: number,
    opts?: { vizitkaId?: string; subscriptionMonths?: 3 | 6 | 12 },
  ) {
    const amount = this.assertAmountSom(amountSom);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    const hasViz = opts?.vizitkaId != null;
    const hasMo = opts?.subscriptionMonths != null;
    if (hasViz !== hasMo) {
      throw new BadRequestException('vizitkaId va subscriptionMonths birga yuborilishi kerak');
    }

    if (hasViz && hasMo) {
      const expected = VIZITKA_SUBSCRIPTION_PRICE_SOM[opts.subscriptionMonths!];
      if (amount !== expected) {
        throw new BadRequestException('Summa tanlangan paket narxi bilan mos emas');
      }
      const viz = await this.prisma.vizitka.findFirst({
        where: { id: opts.vizitkaId, ownerPublicId: user.publicId },
      });
      if (!viz) {
        throw new NotFoundException('Vizitka topilmadi');
      }
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

    const merchantTransId =
      hasViz && hasMo
        ? `vxt|${opts!.vizitkaId}|${opts!.subscriptionMonths}|${userId}|${newRandomMerchantTransId(16)}`
        : newRandomMerchantTransId(22);

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

    const subMeta = parseVizitkaSubscriptionMerchantId(merchantTransId);
    if (subMeta) {
      if (subMeta.userId !== payment.userId) {
        return { error: -6, error_note: 'Transaction does not exist' };
      }
      if (payment.amount !== VIZITKA_SUBSCRIPTION_PRICE_SOM[subMeta.months]) {
        return { error: -2, error_note: 'Incorrect parameter amount' };
      }
      const owner = await this.prisma.user.findUnique({
        where: { id: payment.userId },
      });
      if (!owner) {
        return { error: -6, error_note: 'Transaction does not exist' };
      }
      const vizCheck = await this.prisma.vizitka.findFirst({
        where: { id: subMeta.vizitkaId, ownerPublicId: owner.publicId },
      });
      if (!vizCheck) {
        return { error: -6, error_note: 'Transaction does not exist' };
      }
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const freshPayment = await tx.payment.findUnique({
          where: { id: payment.id },
        });

        if (!freshPayment || freshPayment.status === 'PAID') {
          return freshPayment;
        }

        const meta = parseVizitkaSubscriptionMerchantId(freshPayment.merchantTransId);
        const now = new Date();

        if (meta) {
          const userRow = await tx.user.findUnique({
            where: { id: freshPayment.userId },
          });
          if (!userRow) {
            throw new Error('NO_USER');
          }
          const viz = await tx.vizitka.findFirst({
            where: { id: meta.vizitkaId, ownerPublicId: userRow.publicId },
          });
          if (!viz) {
            throw new Error('NO_VIZ');
          }
          const nextEnd = extendSubscriptionExpiry(viz.expiredAt, meta.months, now);
          await tx.vizitka.update({
            where: { id: viz.id },
            data: { expiredAt: nextEnd },
          });

          return tx.payment.update({
            where: { id: freshPayment.id },
            data: {
              status: 'PAID',
              paidAt: now,
              clickTransId,
              clickPaydocId: String(data.click_paydoc_id ?? ''),
              merchantConfirmId: freshPayment.id,
            },
          });
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
