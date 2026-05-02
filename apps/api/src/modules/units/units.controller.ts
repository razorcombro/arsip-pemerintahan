import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards
} from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { UnitsService } from "./units.service";
import { CreateUnitDto } from "./dto/create-unit.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("units")
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  findAll() {
    return this.unitsService.findAll();
  }

  @Roles("SUPER_ADMIN", "ADMIN_INSTANSI")
  @Post()
  create(@Body() dto: CreateUnitDto) {
    return this.unitsService.create(dto);
  }
}
