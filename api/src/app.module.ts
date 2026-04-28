import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'node:path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TelegramModule } from './telegram/telegram.module';
import { VizitkaModule } from './vizitka/vizitka.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // dist/src is compile output — ../.. = api, ../../.. = monorepo root
      envFilePath: [join(__dirname, '..', '..', '..', '.env'), join(__dirname, '..', '..', '.env')],
    }),
    PrismaModule,
    AuthModule,
    TelegramModule,
    VizitkaModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
