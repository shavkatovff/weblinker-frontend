import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { VizitkaService } from "../vizitka/vizitka.service";
import { AppSettingsService } from "../settings/app-settings.service";
import { AdminUpdateVizitkaDto } from "./dto/admin-update-vizitka.dto";
import { UpdateBalanceDto } from "./dto/update-balance.dto";
import { UpdateAppSettingsDto } from "./dto/update-app-settings.dto";

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vizitkaSvc: VizitkaService,
    private readonly appSettings: AppSettingsService,
  ) {}

  async stats() {
    const [users, vizitkas, paymentsTotal, paymentsPaid] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.vizitka.count(),
      this.prisma.payment.count(),
      this.prisma.payment.count({ where: { status: "PAID" } }),
    ]);
    const paidAgg = await this.prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    });
    return {
      users,
      vizitkas,
      paymentsTotal,
      paymentsPaid,
      paidAmountSom: paidAgg._sum.amount ?? 0,
    };
  }

  async listVizitkas() {
    const rows = await this.prisma.vizitka.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        user: {
          select: {
            number: true,
            publicId: true,
            fullName: true,
          },
        },
      },
    });
    return {
      items: rows.map((v) => ({
        ...this.vizitkaSvc.toPublicSiteJson(v),
        vizitkaStatus: v.status,
        expiredAt: v.expiredAt ? v.expiredAt.toISOString() : null,
        ownerNumber: v.user.number,
        ownerPublicId: v.user.publicId,
        ownerName: v.user.fullName,
      })),
    };
  }

  async getVizitka(id: string) {
    const v = await this.prisma.vizitka.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            number: true,
            publicId: true,
            fullName: true,
          },
        },
      },
    });
    if (!v) throw new NotFoundException("Vizitka topilmadi");
    const { user, ...rest } = v;
    return {
      vizitka: rest,
      site: this.vizitkaSvc.toPublicSiteJson(v),
      owner: user,
    };
  }

  async updateVizitka(id: string, dto: AdminUpdateVizitkaDto) {
    const v = await this.prisma.vizitka.findUnique({ where: { id } });
    if (!v) throw new NotFoundException("Vizitka topilmadi");

    if (dto.name !== undefined && dto.name !== v.name) {
      this.vizitkaSvc.assertNameAllowed(dto.name);
      const clash = await this.prisma.vizitka.findUnique({
        where: { name: dto.name },
      });
      if (clash && clash.id !== id) {
        throw new ConflictException("Bu slug band");
      }
    }

    const patch: Record<string, unknown> = {};
    const skipExpiredFromBody = dto.extendByDays != null;

    if (dto.extendByDays != null) {
      const now = new Date();
      const base =
        v.expiredAt != null && v.expiredAt.getTime() > now.getTime()
          ? v.expiredAt
          : now;
      patch.expiredAt = new Date(
        base.getTime() + dto.extendByDays * 86400000,
      );
    }

    for (const [k, val] of Object.entries(dto)) {
      if (val === undefined) continue;
      if (k === "extendByDays") continue;
      if (k === "expiredAt") {
        if (skipExpiredFromBody) continue;
        patch.expiredAt = val === null ? null : new Date(val as string);
        continue;
      }
      if ((k === "logoUrl" || k === "photoUrl") && val === "") {
        patch[k] = null;
      } else {
        patch[k] = val;
      }
    }

    const mergedExpired =
      patch.expiredAt !== undefined
        ? (patch.expiredAt as Date | null)
        : v.expiredAt;
    if (mergedExpired != null && mergedExpired.getTime() > Date.now()) {
      patch.expiryNoticeSentAt = null;
    }

    const u = await this.prisma.vizitka.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: patch as any,
    });
    return { site: this.vizitkaSvc.toPublicSiteJson(u) };
  }

  async deleteVizitka(id: string) {
    const v = await this.prisma.vizitka.findUnique({ where: { id } });
    if (!v) throw new NotFoundException("Vizitka topilmadi");
    await this.prisma.vizitka.delete({ where: { id } });
    return { ok: true };
  }

  async listUsers() {
    const rows = await this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        publicId: true,
        number: true,
        fullName: true,
        username: true,
        balance: true,
        createdAt: true,
        _count: { select: { vizitkas: true } },
      },
    });
    return {
      items: rows.map((u) => ({
        id: u.id,
        publicId: u.publicId,
        number: u.number,
        fullName: u.fullName,
        username: u.username,
        balance: Number(u.balance),
        createdAt: u.createdAt.toISOString(),
        vizitkaCount: u._count.vizitkas,
      })),
    };
  }

  async getUser(id: number) {
    const u = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: { select: { vizitkas: true, payments: true } },
      },
    });
    if (!u) throw new NotFoundException("Foydalanuvchi topilmadi");
    return {
      user: {
        id: u.id,
        publicId: u.publicId,
        number: u.number,
        fullName: u.fullName,
        username: u.username,
        telegramId: u.telegramId,
        balance: Number(u.balance),
        createdAt: u.createdAt.toISOString(),
        vizitkaCount: u._count.vizitkas,
        paymentCount: u._count.payments,
      },
    };
  }

  async updateUserBalance(userId: number, dto: UpdateBalanceDto) {
    const u = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!u) throw new NotFoundException("Foydalanuvchi topilmadi");
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { balance: new Prisma.Decimal(dto.balance) },
    });
    return {
      user: {
        id: updated.id,
        publicId: updated.publicId,
        number: updated.number,
        balance: Number(updated.balance),
      },
    };
  }

  async listPayments(take = 100, skip = 0) {
    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        take: Math.min(take, 500),
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              number: true,
              fullName: true,
              publicId: true,
            },
          },
        },
      }),
      this.prisma.payment.count(),
    ]);
    return {
      total,
      items: items.map((p) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        merchantTransId: p.merchantTransId,
        clickTransId: p.clickTransId,
        createdAt: p.createdAt.toISOString(),
        paidAt: p.paidAt?.toISOString() ?? null,
        user: {
          id: p.user.id,
          number: p.user.number,
          fullName: p.user.fullName,
          publicId: p.user.publicId,
        },
      })),
    };
  }

  async getAppSettings() {
    const r = await this.appSettings.get();
    return {
      freePublishDays: r.freePublishDays,
      paket3Som: r.paket3Som,
      paket6Som: r.paket6Som,
      paket12Som: r.paket12Som,
      updatedAt: r.updatedAt.toISOString(),
    };
  }

  async updateAppSettings(dto: UpdateAppSettingsDto) {
    const r = await this.appSettings.update(dto);
    return {
      freePublishDays: r.freePublishDays,
      paket3Som: r.paket3Som,
      paket6Som: r.paket6Som,
      paket12Som: r.paket12Som,
      updatedAt: r.updatedAt.toISOString(),
    };
  }
}
