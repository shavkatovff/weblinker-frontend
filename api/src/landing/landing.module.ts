import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { TelegramModule } from "../telegram/telegram.module";
import { LandingController } from "./landing.controller";
import { LandingService } from "./landing.service";

@Module({
  imports: [PrismaModule, AuthModule, TelegramModule],
  controllers: [LandingController],
  providers: [LandingService],
  exports: [LandingService],
})
export class LandingModule {}
