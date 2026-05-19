import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Request } from 'express';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { JwtAccessGuard } from '../auth/jwt-access.guard';
import { ChargeLandingSubscriptionDto } from './dto/charge-landing-subscription.dto';
import { ExtendLandingSubscriptionDto } from './dto/extend-landing-subscription.dto';
import { CreateLandingDto } from './dto/create-landing.dto';
import { UpdateLandingDto } from './dto/update-landing.dto';
import { LandingsService } from './landings.service';

type MulterIncomingFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
};
type StoredFile = MulterIncomingFile & { filename: string };
type MulterDestinationCb = (err: Error | null, dest: string) => void;
type MulterFilenameCb = (err: Error | null, name: string) => void;
type MulterFileFilterCb = (err: Error | null, accept: boolean) => void;

@Controller('landings')
export class LandingsController {
  constructor(private readonly svc: LandingsService) {}

  @Get('public/:name')
  async getPublic(@Param('name') name: string) {
    const data = await this.svc.getPublic(name);
    if (!data) throw new NotFoundException();
    return data;
  }

  @Post('charge-create-package')
  @UseGuards(JwtAccessGuard)
  async chargeCreatePackage(
    @Req() req: { user: { sub: number } },
    @Body() dto: ChargeLandingSubscriptionDto,
  ) {
    return this.svc.chargeCreateSubscription(req.user.sub, dto.months);
  }

  @Post('charge-ai-starter')
  @UseGuards(JwtAccessGuard)
  async chargeAiStarter(@Req() req: { user: { sub: number } }) {
    return this.svc.chargeAiStarter(req.user.sub);
  }

  @Post(':id/extend-subscription')
  @UseGuards(JwtAccessGuard)
  async extendSubscription(
    @Param('id') id: string,
    @Req() req: { user: { sub: number; pid: string } },
    @Body() dto: ExtendLandingSubscriptionDto,
  ) {
    return this.svc.extendSubscription(id, req.user.pid, dto.months);
  }

  @Get('mine')
  @UseGuards(JwtAccessGuard)
  async listMine(@Req() req: { user: { sub: number; pid: string } }) {
    return this.svc.listMine(req.user.pid);
  }

  @Post()
  @UseGuards(JwtAccessGuard)
  async create(
    @Req() req: { user: { sub: number; pid: string } },
    @Body() dto: CreateLandingDto,
  ) {
    return this.svc.create(req.user.pid, dto);
  }

  @Get(':id')
  @UseGuards(JwtAccessGuard)
  async getOne(
    @Param('id') id: string,
    @Req() req: { user: { sub: number; pid: string } },
  ) {
    return this.svc.getMine(id, req.user.pid);
  }

  @Patch(':id')
  @UseGuards(JwtAccessGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLandingDto,
    @Req() req: { user: { sub: number; pid: string } },
  ) {
    return this.svc.update(id, req.user.pid, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAccessGuard)
  async remove(
    @Param('id') id: string,
    @Req() req: { user: { sub: number; pid: string } },
  ) {
    return this.svc.remove(id, req.user.pid);
  }

  @Post(':id/upload')
  @UseGuards(JwtAccessGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (
        _req: Request,
        file: MulterIncomingFile,
        cb: MulterFileFilterCb,
      ) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('Faqat rasm fayli'), false);
          return;
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (
          _req: Request,
          _file: MulterIncomingFile,
          cb: MulterDestinationCb,
        ) => {
          const dir = join(process.cwd(), 'uploads', 'landings');
          if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (
          req: Request,
          file: MulterIncomingFile,
          cb: MulterFilenameCb,
        ) => {
          const idParam = (req.params as { id?: string }).id ?? 'site';
          const kind = (req.query as { kind?: string }).kind ?? 'img';
          const ext = extname(file.originalname || '').toLowerCase();
          const safe = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)
            ? ext
            : '.jpg';
          cb(null, `${idParam}-${kind}-${randomUUID()}${safe}`);
        },
      }),
    }),
  )
  async upload(
    @Param('id') id: string,
    @Query('kind') kind: string | undefined,
    @UploadedFile() file: StoredFile | undefined,
    @Req() req: { user: { sub: number; pid: string } },
  ) {
    if (!file) throw new BadRequestException('Fayl tanlang');
    const k =
      kind === 'about' ? 'about' : kind === 'logo' ? 'logo' : 'hero';
    const relativeUrl = `/uploads/landings/${file.filename}`;
    return this.svc.saveUploadedImage(id, req.user.pid, k, relativeUrl);
  }
}
