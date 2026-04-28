import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAccessGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: { sub: number; pid: string } }>();
    const a = req.headers["authorization"] ?? (req.headers as { Authorization?: string }).Authorization;
    const h = Array.isArray(a) ? a[0] : a;
    if (!h?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Token talab");
    }
    const secret = this.config.get<string>("JWT_ACCESS_SECRET");
    if (!secret) throw new Error("JWT_ACCESS_SECRET is not set");
    try {
      const p = this.jwt.verify<{
        sub: number;
        pid: string;
        typ: string;
      }>(h.slice(7), { secret });
      if (p.typ !== "access") {
        throw new UnauthorizedException("Noto‘g‘ri token turi");
      }
      req.user = { sub: p.sub, pid: p.pid };
      return true;
    } catch {
      throw new UnauthorizedException("Kirish muddati tugadi yoki token noto‘g‘ri");
    }
  }
}
