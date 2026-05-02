import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAccessGuard } from "../auth/jwt-access.guard";
import { AdminGuard } from "./admin.guard";
import { AdminService } from "./admin.service";
import { AdminUpdateVizitkaDto } from "./dto/admin-update-vizitka.dto";
import { UpdateBalanceDto } from "./dto/update-balance.dto";

@Controller("api/admin")
@UseGuards(JwtAccessGuard, AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("stats")
  async stats() {
    return this.admin.stats();
  }

  @Get("vizitkas")
  async listVizitkas() {
    return this.admin.listVizitkas();
  }

  @Get("vizitkas/:id")
  async getVizitka(@Param("id") id: string) {
    return this.admin.getVizitka(id);
  }

  @Patch("vizitkas/:id")
  async updateVizitka(
    @Param("id") id: string,
    @Body() body: AdminUpdateVizitkaDto,
  ) {
    return this.admin.updateVizitka(id, body);
  }

  @Get("users")
  async listUsers() {
    return this.admin.listUsers();
  }

  @Get("users/:id")
  async getUser(@Param("id", ParseIntPipe) id: number) {
    return this.admin.getUser(id);
  }

  @Patch("users/:id/balance")
  async updateBalance(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateBalanceDto,
  ) {
    return this.admin.updateUserBalance(id, body);
  }

  @Get("payments")
  async listPayments(
    @Query("take") take?: string,
    @Query("skip") skip?: string,
  ) {
    const t = take ? parseInt(take, 10) : 100;
    const s = skip ? parseInt(skip, 10) : 0;
    return this.admin.listPayments(
      Number.isFinite(t) ? t : 100,
      Number.isFinite(s) ? s : 0,
    );
  }
}
