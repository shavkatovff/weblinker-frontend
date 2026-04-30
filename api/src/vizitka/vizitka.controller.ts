import {
  Body,
  Controller,
  Delete,
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
  async mine(@Req() req: { user: { sub: number; pid: string } }) {
    return this.svc.listMine(req.user.pid);
  }

  @Post()
  @UseGuards(JwtAccessGuard)
  async create(
    @Body() body: CreateVizitkaDto,
    @Req() req: { user: { sub: number; pid: string } },
  ) {
    return this.svc.create(body, req.user.pid);
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
