import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SettingsModule } from '../settings/settings.module';
import { LandingsController } from './landings.controller';
import { LandingsService } from './landings.service';

@Module({
  imports: [PrismaModule, AuthModule, SettingsModule],
  controllers: [LandingsController],
  providers: [LandingsService],
  exports: [LandingsService],
})
export class LandingsModule {}
