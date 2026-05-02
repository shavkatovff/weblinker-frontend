import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AdminGuard } from "./admin.guard";
import { JwtAccessGuard } from "./jwt-access.guard";

function isAdminApiOpen(config: ConfigService): boolean {
  const v = config.get<string>("ADMIN_API_OPEN")?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/**
 * `ADMIN_API_OPEN=1` — admin API vaqtincha ochiq (JWT / admin rolini talab qilmaydi).
 * Productionda o‘chiring yoki `ADMIN_PUBLIC_IDS` + JWT ishlating.
 */
@Injectable()
export class AdminApiAccessGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtAccessGuard,
    private readonly admin: AdminGuard,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    if (isAdminApiOpen(this.config)) {
      return true;
    }
    this.jwt.canActivate(context);
    return this.admin.canActivate(context);
  }
}
