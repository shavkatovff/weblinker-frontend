import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type Landing } from '@prisma/client';
import {
  assertNameAllowed,
  assertNameFreeAcrossModels,
} from '../common/reserved-names';
import { PrismaService } from '../prisma/prisma.service';
import { AppSettingsService } from '../settings/app-settings.service';
import {
  computeSubscriptionExpiredAt,
  computeTrialExpiredAt,
  extendSubscriptionExpiry,
} from '../vizitka/subscription';
import type { CreateLandingDto } from './dto/create-landing.dto';
import type { UpdateLandingDto } from './dto/update-landing.dto';

@Injectable()
export class LandingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appSettings: AppSettingsService,
  ) {}

  /** Mahalliy landing paketi — balansdan yechiladi */
  async chargeCreateSubscription(
    userId: number,
    months: 6 | 12,
  ): Promise<{ ok: true }> {
    const priceSom = await this.appSettings.priceLandingSomForMonths(months);
    const price = new Prisma.Decimal(priceSom);
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Foydalanuvchi topilmadi');
      }
      if (user.balance.lt(price)) {
        throw new BadRequestException(
          `Balans yetarli emas. Paket: ${priceSom.toLocaleString('uz-UZ')} so'm. Joriy balans: ${Number(user.balance).toLocaleString('uz-UZ')} so'm.`,
        );
      }
      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: price } },
      });
    });
    return { ok: true };
  }

  /** AI bilan landing — boshlang‘ich paket (bir martalik) */
  async chargeAiStarter(userId: number): Promise<{ ok: true }> {
    const priceSom = 5000;
    const price = new Prisma.Decimal(priceSom);
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Foydalanuvchi topilmadi');
      }
      if (user.balance.lt(price)) {
        throw new BadRequestException(
          `Balans yetarli emas. AI paket: ${priceSom.toLocaleString('uz-UZ')} so'm. Joriy balans: ${Number(user.balance).toLocaleString('uz-UZ')} so'm.`,
        );
      }
      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: price } },
      });
    });
    return { ok: true };
  }

  /** Mavjud landing obunasini balansdan uzaytirish */
  async extendSubscription(
    landingId: string,
    ownerPublicId: string,
    months: 6 | 12,
  ): Promise<{ landing: Landing }> {
    const priceSom = await this.appSettings.priceLandingSomForMonths(months);
    const price = new Prisma.Decimal(priceSom);
    const now = new Date();

    const landing = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.landing.findFirst({
        where: { id: landingId, ownerPublicId },
      });
      if (!existing) {
        throw new NotFoundException('Landing topilmadi');
      }
      const user = await tx.user.findUnique({
        where: { publicId: ownerPublicId },
      });
      if (!user) {
        throw new NotFoundException('Foydalanuvchi topilmadi');
      }
      if (user.balance.lt(price)) {
        throw new BadRequestException(
          `Balans yetarli emas. Paket: ${priceSom.toLocaleString('uz-UZ')} so'm. Joriy balans: ${Number(user.balance).toLocaleString('uz-UZ')} so'm.`,
        );
      }
      await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: price } },
      });
      const nextEnd = extendSubscriptionExpiry(existing.expiredAt, months, now);
      return tx.landing.update({
        where: { id: landingId },
        data: {
          expiredAt: nextEnd,
          plan: `${months}oy`,
          expiryNoticeSentAt: null,
        },
      });
    });

    return { landing };
  }

  async listMine(ownerPublicId: string): Promise<{ landings: Landing[] }> {
    const landings = await this.prisma.landing.findMany({
      where: { ownerPublicId },
      orderBy: { updatedAt: 'desc' },
    });
    return { landings };
  }

  /** `name` va boshqa boshlang‘ich maydonlar bilan yangi landing yaratish */
  async create(
    ownerPublicId: string,
    dto: CreateLandingDto & UpdateLandingDto,
  ): Promise<{ landing: Landing }> {
    const { name, subscriptionMonths, ...rest } = dto;
    assertNameAllowed(name);
    const now = new Date();
    const settings = await this.appSettings.get();
    const trialDays = settings.freePublishDays;
    const expiredAt =
      subscriptionMonths != null
        ? computeSubscriptionExpiredAt(subscriptionMonths, now)
        : computeTrialExpiredAt(now, trialDays);
    const plan =
      subscriptionMonths != null ? `${subscriptionMonths}oy` : '10kun';

    const landing = await this.prisma.$transaction(async (tx) => {
      await assertNameFreeAcrossModels(tx, name);
      const data: Record<string, unknown> = {
        ownerPublicId,
        name,
        expiredAt,
        plan,
      };
      for (const [k, v] of Object.entries(rest)) {
        if (v !== undefined) data[k] = v;
      }
      try {
        return await tx.landing.create({
          data: data as Prisma.LandingUncheckedCreateInput,
        });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002'
        ) {
          throw new ConflictException('Bu manzil allaqachon band');
        }
        throw e;
      }
    });
    return { landing };
  }

  async getMine(
    id: string,
    ownerPublicId: string,
  ): Promise<{ landing: Landing }> {
    const landing = await this.prisma.landing.findFirst({
      where: { id, ownerPublicId },
    });
    if (!landing) {
      throw new NotFoundException('Landing topilmadi');
    }
    return { landing };
  }

  /** Ommaviy domen — auth shart emas. `weblinker.uz/{name}` ochilganda chaqiriladi. */
  async getPublic(
    name: string,
  ): Promise<
    | { landing: Landing }
    | {
        publicPause: {
          kind: 'expired';
          slug: string;
          businessName: string;
        };
        landing: Landing;
      }
    | null
  > {
    const landing = await this.prisma.landing.findUnique({
      where: { name },
    });
    if (!landing) return null;

    const now = new Date();
    const expiredByDate =
      landing.expiredAt != null && landing.expiredAt < now;
    if (!expiredByDate) {
      return { landing };
    }

    const businessName =
      (landing.brandName && landing.brandName.trim()) ||
      name.replace(/-/g, ' ');

    return {
      publicPause: {
        kind: 'expired' as const,
        slug: landing.name,
        businessName,
      },
      landing,
    };
  }

  async update(
    id: string,
    ownerPublicId: string,
    dto: UpdateLandingDto,
  ): Promise<{ landing: Landing }> {
    const landing = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.landing.findFirst({
        where: { id, ownerPublicId },
      });
      if (!existing) {
        throw new NotFoundException('Landing topilmadi');
      }
      if (dto.name && dto.name !== existing.name) {
        assertNameAllowed(dto.name);
        await assertNameFreeAcrossModels(tx, dto.name, {
          kind: 'landing',
          id,
        });
      }
      const data: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(dto)) {
        if (v !== undefined) data[k] = v;
      }
      try {
        return await tx.landing.update({ where: { id }, data });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002'
        ) {
          throw new ConflictException('Bu manzil allaqachon band');
        }
        throw e;
      }
    });
    return { landing };
  }

  async remove(id: string, ownerPublicId: string): Promise<{ ok: true }> {
    const existing = await this.prisma.landing.findFirst({
      where: { id, ownerPublicId },
    });
    if (!existing) {
      throw new NotFoundException('Landing topilmadi');
    }
    await this.prisma.landing.delete({ where: { id } });
    return { ok: true };
  }

  /** Diskdan rasm yuklangach `hero_image_url` yoki `about_image_url` ni yangilash */
  async saveUploadedImage(
    id: string,
    ownerPublicId: string,
    kind: 'hero' | 'about' | 'logo',
    relativeUrl: string,
  ): Promise<{ landing: Landing }> {
    const existing = await this.prisma.landing.findFirst({
      where: { id, ownerPublicId },
    });
    if (!existing) {
      throw new NotFoundException('Landing topilmadi');
    }
    const data =
      kind === 'hero'
        ? { heroImageUrl: relativeUrl }
        : kind === 'about'
          ? { aboutImageUrl: relativeUrl }
          : { logourl: relativeUrl };
    const landing = await this.prisma.landing.update({
      where: { id },
      data,
    });
    return { landing };
  }
}
