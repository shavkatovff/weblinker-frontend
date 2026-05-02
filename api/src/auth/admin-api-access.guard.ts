import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AdminGuard } from "./admin.guard";
import { JwtAccessGuard } from "./jwt-access.guard";

function adminRequiresJwt(config: ConfigService): boolean {
  const lock = config.get<string>("ADMIN_LOCKDOWN")?.trim().toLowerCase();
  if (lock === "1" || lock === "true" || lock === "yes") {
    return true;
  }
  return false;
}

/**
 * Default: admin API ochiq. Faqat `ADMIN_LOCKDOWN=1` bo‘lsa JWT + `ADMIN_PUBLIC_IDS`.
 * (Eski `ADMIN_API_OPEN` / `ADMIN_AUTH_REQUIRED` endi yopish uchun ishlatilmaydi — chalkashlikni kamaytirish.)
 */
@Injectable()
export class AdminApiAccessGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtAccessGuard,
    private readonly admin: AdminGuard,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    if (!adminRequiresJwt(this.config)) {
      return true;
    }
    this.jwt.canActivate(context);
    return this.admin.canActivate(context);
  }
}
