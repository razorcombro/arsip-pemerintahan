import {
  BadRequestException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
import { CreateArchiveDto } from "./dto/create-archive.dto";
import { UpdateArchiveDto } from "./dto/update-archive.dto";

@Injectable()
export class ArchivesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService
  ) {}

  async create(dto: CreateArchiveDto, userId?: string) {
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

    await this.auditLogsService.createLog({
      userId,
      archiveId: archive.id,
      action: "CREATE",
      entityType: "Archive",
      entityId: archive.id,
      description: `Membuat arsip ${archive.archiveNumber}`
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

  async findOne(id: string, userId?: string) {
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

    await this.auditLogsService.createLog({
      userId,
      archiveId: archive.id,
      action: "VIEW",
      entityType: "Archive",
      entityId: archive.id,
      description: `Melihat detail arsip ${archive.archiveNumber}`
    });

    return {
      message: "Detail arsip",
      data: archive
    };
  }

  async update(id: string, dto: UpdateArchiveDto, userId?: string) {
    const existingArchive = await this.prisma.archive.findUnique({
      where: { id }
    });

    if (!existingArchive) {
      throw new NotFoundException("Arsip tidak ditemukan");
    }

    if (dto.createdByUnitId) {
      const unit = await this.prisma.unit.findUnique({
        where: { id: dto.createdByUnitId }
      });

      if (!unit) {
        throw new BadRequestException("Unit tidak ditemukan");
      }
    }

    if (dto.classificationId) {
      const classification = await this.prisma.classification.findUnique({
        where: { id: dto.classificationId }
      });

      if (!classification) {
        throw new BadRequestException("Klasifikasi tidak ditemukan");
      }
    }

    const archive = await this.prisma.archive.update({
      where: { id },
      data: {
        letterNumber: dto.letterNumber,
        title: dto.title,
        summary: dto.summary,
        createdByUnitId: dto.createdByUnitId,
        classificationId: dto.classificationId,
        securityLevel: dto.securityLevel,
        status: dto.status,
        keywords: dto.keywords,
        version: {
          increment: 1
        }
      },
      include: {
        createdByUnit: true,
        classification: true,
        files: true
      }
    });

    await this.auditLogsService.createLog({
      userId,
      archiveId: archive.id,
      action: "UPDATE",
      entityType: "Archive",
      entityId: archive.id,
      description: `Memperbarui arsip ${archive.archiveNumber}`
    });

    return {
      message: "Arsip berhasil diperbarui",
      data: archive
    };
  }

  async remove(id: string, userId?: string) {
    const existingArchive = await this.prisma.archive.findUnique({
      where: { id }
    });

    if (!existingArchive) {
      throw new NotFoundException("Arsip tidak ditemukan");
    }

    const archive = await this.prisma.archive.update({
      where: { id },
      data: {
        status: "DESTROYED",
        version: {
          increment: 1
        }
      },
      include: {
        createdByUnit: true,
        classification: true,
        files: true
      }
    });

    await this.auditLogsService.createLog({
      userId,
      archiveId: archive.id,
      action: "DELETE",
      entityType: "Archive",
      entityId: archive.id,
      description: `Soft delete arsip ${archive.archiveNumber}`
    });

    return {
      message: "Arsip berhasil dihapus secara soft delete",
      data: archive
    };
  }
}
