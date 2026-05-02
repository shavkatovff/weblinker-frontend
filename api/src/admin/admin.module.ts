import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { VizitkaModule } from "../vizitka/vizitka.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [PrismaModule, VizitkaModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
