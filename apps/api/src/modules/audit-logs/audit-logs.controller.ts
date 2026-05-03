import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { AuditLogsService } from "./audit-logs.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("audit-logs")
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Roles("SUPER_ADMIN", "ADMIN_INSTANSI", "AUDITOR")
  @Get()
  findAll() {
    return this.auditLogsService.findAll();
  }
}
