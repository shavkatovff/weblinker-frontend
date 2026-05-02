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
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { existsSync, mkdirSync } from "node:fs";
import { extname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { JwtAccessGuard } from "../auth/jwt-access.guard";
import { CreateVizitkaDto, UpdateVizitkaBodyDto } from "./dto/create-vizitka.dto";
import { VizitkaService } from "./vizitka.service";

@Controller("vizitka")
export class VizitkaController {
  constructor(private readonly svc: VizitkaService) {}

  @Get("public/:name")
  async getPublic(@Param("name") name: string) {
    const data = await this.svc.getPublicByName(name);
    if (!data) {
      throw new NotFoundException();
    }
    return data;
  }

  @Get("mine")
  @UseGuards(JwtAccessGuard)
  async mine(@Req() req: { user: { sub: number; pid: string } }) {
    return this.svc.listMine(req.user.pid);
  }

  @Get(":id")
  @UseGuards(JwtAccessGuard)
  async getOne(
    @Param("id") id: string,
    @Req() req: { user: { sub: number; pid: string } },
  ) {
    return this.svc.getMineOne(id, req.user.pid);
  }

  @Post()
  @UseGuards(JwtAccessGuard)
  async create(
    @Body() body: CreateVizitkaDto,
    @Req() req: { user: { sub: number; pid: string } },
  ) {
    return this.svc.create(body, req.user.pid);
  }

  @Post(":id/logo")
  @UseGuards(JwtAccessGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
          cb(new BadRequestException("Faqat rasm fayli"), false);
          return;
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(process.cwd(), "uploads", "logos");
          if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          const idParam = (req.params as { id?: string })["id"] ?? "logo";
          const ext = extname(file.originalname || "").toLowerCase();
          const safe = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)
            ? ext
            : ".jpg";
          cb(null, `${idParam}-${randomUUID()}${safe}`);
        },
      }),
    }),
  )
  async uploadLogo(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: { sub: number; pid: string } },
  ) {
    if (!file) {
      throw new BadRequestException("Fayl tanlang");
    }
    const relativeUrl = `/uploads/logos/${file.filename}`;
    return this.svc.saveUploadedLogo(id, req.user.pid, relativeUrl);
  }

  @Patch(":id")
  @UseGuards(JwtAccessGuard)
  async update(
    @Param("id") id: string,
    @Body() body: UpdateVizitkaBodyDto,
    @Req() req: { user: { sub: number; pid: string } },
  ) {
    return this.svc.update(id, body, req.user.pid);
  }

  @Delete(":id")
  @UseGuards(JwtAccessGuard)
  async remove(@Param("id") id: string, @Req() req: { user: { sub: number; pid: string } }) {
    await this.svc.remove(id, req.user.pid);
    return { ok: true };
  }
}
