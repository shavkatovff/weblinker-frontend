import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { TelegramModule } from "../telegram/telegram.module";
import { VizitkaController } from "./vizitka.controller";
import { VizitkaService } from "./vizitka.service";
import { VizitkaExpiryNotifierService } from "./vizitka-expiry-notifier.service";

@Module({
  imports: [PrismaModule, AuthModule, TelegramModule],
  controllers: [VizitkaController],
  providers: [VizitkaService, VizitkaExpiryNotifierService],
  exports: [VizitkaService],
})
export class VizitkaModule {}
