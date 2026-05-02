import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards
} from "@nestjs/common";
import { ArchivesService } from "./archives.service";
import { CreateArchiveDto } from "./dto/create-archive.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller("archives")
export class ArchivesController {
  constructor(private readonly archivesService: ArchivesService) {}

  @Post()
  create(@Body() dto: CreateArchiveDto) {
    return this.archivesService.create(dto);
  }

  @Get()
  findAll() {
    return this.archivesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.archivesService.findOne(id);
  }
}
