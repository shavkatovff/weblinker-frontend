import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/** `.env`: `ADMIN_PUBLIC_IDS` — vergul bilan ajratilgan `users.public_id` (cuid) */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<{ user?: { pid: string } }>();
    const pid = req.user?.pid;
    if (!pid) throw new ForbiddenException("Kirish talab");
    const raw = this.config.get<string>("ADMIN_PUBLIC_IDS") ?? "";
    const allowed = new Set(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    if (allowed.size === 0) {
      throw new ForbiddenException("ADMIN_PUBLIC_IDS sozlanmagan");
    }
    if (!allowed.has(pid)) {
      throw new ForbiddenException("Admin huquqi yo‘q");
    }
    return true;
  }
}
