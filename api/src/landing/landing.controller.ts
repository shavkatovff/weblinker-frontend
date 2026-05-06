import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAccessGuard } from "../auth/jwt-access.guard";
import { UpsertLandingDto } from "./dto/upsert-landing.dto";
import { CreateLandingInquiryDto } from "./dto/create-landing-inquiry.dto";
import { LandingService } from "./landing.service";

@Controller("landing")
export class LandingController {
  constructor(private readonly svc: LandingService) {}

  @Get("public/:slug")
  async getPublic(@Param("slug") slug: string) {
    const data = await this.svc.getPublicBySlug(slug);
    if (!data) {
      throw new NotFoundException();
    }
    return data;
  }

  @Post("public/:slug/inquiry")
  async postInquiry(
    @Param("slug") slug: string,
    @Body() body: CreateLandingInquiryDto,
  ) {
    return this.svc.createInquiry(slug, body);
  }

  @Post("upsert")
  @UseGuards(JwtAccessGuard)
  async upsert(
    @Req() req: { user: { sub: number; pid: string } },
    @Body() dto: UpsertLandingDto,
  ) {
    return this.svc.upsert(req.user.pid, req.user.sub, {
      publicationId: dto.publicationId,
      slug: dto.slug,
      templateId: dto.templateId,
      status: dto.status,
      content: dto.content,
    });
  }

  @Get(":id")
  @UseGuards(JwtAccessGuard)
  async getMine(
    @Param("id") id: string,
    @Req() req: { user: { sub: number; pid: string } },
  ) {
    return this.svc.getMineOne(id, req.user.pid);
  }
}
