import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SettingsModule } from '../settings/settings.module';
import { SmsModule } from '../sms/sms.module';
import { LandingsController } from './landings.controller';
import { LandingExpiryNotifierService } from './landing-expiry-notifier.service';
import { LandingsService } from './landings.service';

@Module({
  imports: [PrismaModule, AuthModule, SettingsModule, SmsModule],
  controllers: [LandingsController],
  providers: [LandingsService, LandingExpiryNotifierService],
  exports: [LandingsService],
})
export class LandingsModule {}
