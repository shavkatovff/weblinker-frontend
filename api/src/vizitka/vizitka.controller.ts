import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
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
  async mine(@Req() req: { user: { sub: number } }) {
    return this.svc.listMine(req.user.sub);
  }

  @Post()
  @UseGuards(JwtAccessGuard)
  async create(
    @Body() body: CreateVizitkaDto,
    @Req() req: { user: { sub: number } },
  ) {
    return this.svc.create(body, req.user.sub);
  }

  @Patch(":id")
  @UseGuards(JwtAccessGuard)
  async update(
    @Param("id") id: string,
    @Body() body: UpdateVizitkaBodyDto,
    @Req() req: { user: { sub: number } },
  ) {
    return this.svc.update(id, body, req.user.sub);
  }
}
