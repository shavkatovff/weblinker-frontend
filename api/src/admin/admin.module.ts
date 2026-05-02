import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AdminGuard } from "../auth/admin.guard";
import { PrismaModule } from "../prisma/prisma.module";
import { VizitkaModule } from "../vizitka/vizitka.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [PrismaModule, VizitkaModule, AuthModule],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
})
export class AdminModule {}
