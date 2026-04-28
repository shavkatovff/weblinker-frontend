import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { VizitkaController } from "./vizitka.controller";
import { VizitkaService } from "./vizitka.service";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [VizitkaController],
  providers: [VizitkaService],
  exports: [VizitkaService],
})
export class VizitkaModule {}
