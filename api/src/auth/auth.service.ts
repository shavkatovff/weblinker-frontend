import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { normalizeUzPhone, formatPhoneForDisplay } from "../common/phone";
import { verifyCodeConstantTime } from "./auth.crypto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private accessSecret() {
    const s = this.config.get<string>("JWT_ACCESS_SECRET");
    if (!s) throw new Error("JWT_ACCESS_SECRET is not set");
    return s;
  }

  private refreshSecret() {
    const s = this.config.get<string>("JWT_REFRESH_SECRET");
    if (!s) throw new Error("JWT_REFRESH_SECRET is not set");
    return s;
  }

  async validatePhone(phone: string) {
    let normalized: string;
    try {
      normalized = normalizeUzPhone(phone);
    } catch {
      throw new BadRequestException("Telefon noto'g'ri kiritilgan");
    }
    return {
      phone: normalized,
      display: formatPhoneForDisplay(normalized),
    };
  }

  private mapUser(u: {
    id: number;
    publicId: string;
    number: string;
    fullName: string | null;
    username: string | null;
    telegramId: string | null;
    balance: { toString(): string } | number | null;
  }) {
    const bal =
      u.balance == null
        ? 0
        : typeof u.balance === "number"
          ? u.balance
          : parseFloat(String(u.balance));
    return {
      id: u.id,
      publicId: u.publicId,
      number: u.number,
      fullName: u.fullName,
      username: u.username,
      telegramId: u.telegramId,
      balance: Number.isFinite(bal) ? bal : 0,
    };
  }

  private async buildTokens(u: { id: number; publicId: string }) {
    const access = await this.jwt.signAsync(
      { sub: u.id, pid: u.publicId, typ: "access" as const },
      { secret: this.accessSecret(), expiresIn: "15m" },
    );
    const refresh = await this.jwt.signAsync(
      { sub: u.id, pid: u.publicId, typ: "refresh" as const },
      { secret: this.refreshSecret(), expiresIn: "7d" },
    );
    const refreshExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return { accessToken: access, refreshToken: refresh, refreshExp };
  }

  private async saveRefreshHash(userId: number, token: string) {
    // Stateless JWT: token hash optional for revoke; keep exp for display/cleanup
    const { createHash } = await import("crypto");
    const h = createHash("sha256").update(token).digest("hex");
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: h, refreshTokenExp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });
  }

  async verify(phone: string, code: string) {
    const normalized = normalizeUzPhone(phone);
    const now = new Date();

    const u = await this.prisma.user.findUnique({ where: { number: normalized } });
    if (u?.loginOtp && u.loginOtpExpiresAt && u.loginOtpExpiresAt > now) {
      if (verifyCodeConstantTime(code, u.loginOtp)) {
        await this.prisma.user.update({
          where: { id: u.id },
          data: { loginOtp: null, loginOtpExpiresAt: null },
        });
        const t = await this.buildTokens({ id: u.id, publicId: u.publicId });
        await this.saveRefreshHash(u.id, t.refreshToken);
        return { ...t, user: this.mapUser(u) };
      }
    }

    const tg = await this.prisma.tgUser.findUnique({
      where: { number: normalized },
    });
    if (
      tg &&
      tg.loginOtp &&
      tg.loginOtpExpiresAt &&
      tg.loginOtpExpiresAt > now &&
      verifyCodeConstantTime(code, tg.loginOtp)
    ) {
      const created = await this.prisma.$transaction(async (tx) => {
        const nu = await tx.user.create({
          data: {
            number: normalized,
            fullName: tg.fullName,
            username: tg.username,
            telegramId: tg.telegramUserId,
            userId: null,
          },
        });
        const upd = await tx.user.update({
          where: { id: nu.id },
          data: { userId: nu.publicId },
        });
        await tx.tgUser.delete({ where: { id: tg.id } });
        return upd;
      });
      const t = await this.buildTokens({ id: created.id, publicId: created.publicId });
      await this.saveRefreshHash(created.id, t.refreshToken);
      return { ...t, user: this.mapUser(created) };
    }

    throw new UnauthorizedException("Kod yoki raqam noto‘g‘ri / muddati o‘tgan");
  }

  async refresh(refreshToken: string) {
    let payload: { sub: number; typ?: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, { secret: this.refreshSecret() });
    } catch {
      throw new UnauthorizedException("Sessiya yaroqsiz, qayta kiring");
    }
    if (payload.typ !== "refresh" || !payload.sub) {
      throw new UnauthorizedException("Noto‘g‘ri token");
    }
    const u = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!u) throw new UnauthorizedException("Foydalanuvchi topilmadi");
    if (u.refreshTokenExp && u.refreshTokenExp < new Date()) {
      throw new UnauthorizedException("Muddati tugadi, qayta kiring");
    }
    if (u.refreshToken) {
      const { createHash } = await import("crypto");
      const h = createHash("sha256").update(refreshToken).digest("hex");
      if (h !== u.refreshToken) {
        throw new UnauthorizedException("Sessiya bekor qilingan, qayta kiring");
      }
    }
    const t = await this.buildTokens({ id: u.id, publicId: u.publicId });
    await this.saveRefreshHash(u.id, t.refreshToken);
    return t;
  }

  async me(userId: number) {
    const u = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!u) throw new UnauthorizedException();
    return { user: this.mapUser(u) };
  }
}
