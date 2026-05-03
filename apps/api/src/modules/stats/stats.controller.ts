import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { StatsService } from "./stats.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("stats")
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Roles("SUPER_ADMIN", "ADMIN_INSTANSI")
  @Get("dashboard")
  getDashboardStats() {
    return this.statsService.getDashboardStats();
  }
}
