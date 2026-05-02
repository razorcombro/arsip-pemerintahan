import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateArchiveDto } from "./dto/create-archive.dto";

@Injectable()
export class ArchivesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateArchiveDto) {
    const existingArchive = await this.prisma.archive.findUnique({
      where: { archiveNumber: dto.archiveNumber }
    });

    if (existingArchive) {
      throw new BadRequestException("Nomor arsip sudah digunakan");
    }

    const unit = await this.prisma.unit.findUnique({
      where: { id: dto.createdByUnitId }
    });

    if (!unit) {
      throw new BadRequestException("Unit tidak ditemukan");
    }

    const classification = await this.prisma.classification.findUnique({
      where: { id: dto.classificationId }
    });

    if (!classification) {
      throw new BadRequestException("Klasifikasi tidak ditemukan");
    }

    const archive = await this.prisma.archive.create({
      data: {
        archiveNumber: dto.archiveNumber,
        letterNumber: dto.letterNumber,
        title: dto.title,
        summary: dto.summary,
        createdByUnitId: dto.createdByUnitId,
        classificationId: dto.classificationId,
        securityLevel: dto.securityLevel || "BIASA",
        status: dto.status || "DRAFT",
        keywords: dto.keywords || [],
        version: 1
      },
      include: {
        createdByUnit: true,
        classification: true
      }
    });

    return {
      message: "Arsip berhasil dibuat",
      data: archive
    };
  }

  async findAll() {
    const archives = await this.prisma.archive.findMany({
      include: {
        createdByUnit: true,
        classification: true,
        files: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return {
      message: "Daftar arsip",
      data: archives
    };
  }

  async findOne(id: string) {
    const archive = await this.prisma.archive.findUnique({
      where: { id },
      include: {
        createdByUnit: true,
        classification: true,
        files: true
      }
    });

    if (!archive) {
      throw new NotFoundException("Arsip tidak ditemukan");
    }

    return {
      message: "Detail arsip",
      data: archive
    };
  }
}
