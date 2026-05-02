import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards
} from "@nestjs/common";
import { ArchivesService } from "./archives.service";
import { CreateArchiveDto } from "./dto/create-archive.dto";
import { UpdateArchiveDto } from "./dto/update-archive.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller("archives")
export class ArchivesController {
  constructor(private readonly archivesService: ArchivesService) {}

  @Post()
  create(@Body() dto: CreateArchiveDto, @Req() req: any) {
    return this.archivesService.create(dto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.archivesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Req() req: any) {
    return this.archivesService.findOne(id, req.user.userId);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateArchiveDto, @Req() req: any) {
    return this.archivesService.update(id, dto, req.user.userId);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Req() req: any) {
    return this.archivesService.remove(id, req.user.userId);
  }
}
