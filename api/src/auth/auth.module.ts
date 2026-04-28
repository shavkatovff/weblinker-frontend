import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAccessGuard } from "./jwt-access.guard";

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_ACCESS_SECRET", "dev-only-change-me") || "dev",
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessGuard],
  exports: [AuthService, JwtModule, JwtAccessGuard],
})
export class AuthModule {}
