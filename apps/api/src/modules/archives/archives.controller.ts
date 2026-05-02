import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
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
    return this.archivesService.create(dto, req.user);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.archivesService.findAll(req.user);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Req() req: any) {
    return this.archivesService.findOne(id, req.user);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateArchiveDto,
    @Req() req: any
  ) {
    return this.archivesService.update(id, dto, req.user);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Req() req: any) {
    return this.archivesService.remove(id, req.user);
  }

  @Post(":id/upload")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fileSize: 10 * 1024 * 1024
      },
      fileFilter: (req, file, callback) => {
        const allowedTypes = [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ];

        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException("Tipe file tidak diizinkan"),
            false
          );
        }

        callback(null, true);
      }
    })
  )
  uploadFile(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    return this.archivesService.uploadFile(id, file, req.user);
  }

  @Get(":archiveId/files/:fileId/download")
  async downloadFile(
    @Param("archiveId") archiveId: string,
    @Param("fileId") fileId: string,
    @Req() req: any,
    @Res() res: Response
  ) {
    const result = await this.archivesService.downloadFile(
      archiveId,
      fileId,
      req.user
    );

    return res.download(result.filePath, result.originalName);
  }
}
