import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'node:path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TelegramModule } from './telegram/telegram.module';
import { VizitkaModule } from './vizitka/vizitka.module';
import { PaymentModule } from './payment/payment.module';
import { AdminModule } from './admin/admin.module';
import { SettingsModule } from './settings/settings.module';
import { LandingModule } from './landing/landing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // dist/src is compile output — ../.. = api, ../../.. = monorepo root
      envFilePath: [join(__dirname, '..', '..', '..', '.env'), join(__dirname, '..', '..', '.env')],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    SettingsModule,
    AuthModule,
    TelegramModule,
    VizitkaModule,
    PaymentModule,
    AdminModule,
    LandingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
