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
import { ClassificationsService } from "./classifications.service";
import { CreateClassificationDto } from "./dto/create-classification.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("classifications")
export class ClassificationsController {
  constructor(
    private readonly classificationsService: ClassificationsService
  ) {}

  @Get()
  findAll() {
    return this.classificationsService.findAll();
  }

  @Roles("SUPER_ADMIN", "ADMIN_INSTANSI")
  @Post()
  create(@Body() dto: CreateClassificationDto) {
    return this.classificationsService.create(dto);
  }
}
