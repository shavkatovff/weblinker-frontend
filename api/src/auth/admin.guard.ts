import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/** `ADMIN_PUBLIC_IDS` (user `public_id`, vergul bilan) */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user?: { pid?: string } }>();
    const pid = req.user?.pid;
    if (!pid) {
      throw new ForbiddenException();
    }
    const raw = this.config.get<string>("ADMIN_PUBLIC_IDS") ?? "";
    const allowed = new Set(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    if (!allowed.has(pid)) {
      throw new ForbiddenException("Admin huquqi yo‘q");
    }
    return true;
  }
}
