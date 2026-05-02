import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
import { CreateArchiveDto } from "./dto/create-archive.dto";
import { UpdateArchiveDto } from "./dto/update-archive.dto";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

@Injectable()
export class ArchivesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService
  ) {}

  private isPrivileged(roles: string[] = []) {
    return roles.includes("SUPER_ADMIN") || roles.includes("ADMIN_INSTANSI");
  }

  private ensureUnitAccess(
    user: { unitId?: string | null; roles?: string[] },
    archiveUnitId: string
  ) {
    if (this.isPrivileged(user.roles || [])) {
      return true;
    }

    if (!user.unitId) {
      throw new ForbiddenException("User tidak memiliki unit kerja");
    }

    if (user.unitId !== archiveUnitId) {
      throw new ForbiddenException("Anda tidak memiliki akses ke arsip unit ini");
    }

    return true;
  }

  async create(
    dto: CreateArchiveDto,
    user?: { userId?: string; unitId?: string | null; roles?: string[] }
  ) {
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

    if (!this.isPrivileged(user?.roles || [])) {
      if (!user?.unitId || user.unitId !== dto.createdByUnitId) {
        throw new ForbiddenException("Anda hanya boleh membuat arsip untuk unit sendiri");
      }
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
      userId: user?.userId,
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

  async findAll(user?: { unitId?: string | null; roles?: string[] }) {
    const whereClause = this.isPrivileged(user?.roles || [])
      ? {}
      : {
          createdByUnitId: user?.unitId || "__NO_ACCESS__"
        };

    const archives = await this.prisma.archive.findMany({
      where: whereClause,
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
      data: archives.map((archive) => ({
        ...archive,
        files: archive.files.map((file) => ({
          ...file,
          sizeBytes: file.sizeBytes.toString()
        }))
      }))
    };
  }

  async findOne(
    id: string,
    user?: { userId?: string; unitId?: string | null; roles?: string[] }
  ) {
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

    this.ensureUnitAccess(user || {}, archive.createdByUnitId);

    await this.auditLogsService.createLog({
      userId: user?.userId,
      archiveId: archive.id,
      action: "VIEW",
      entityType: "Archive",
      entityId: archive.id,
      description: `Melihat detail arsip ${archive.archiveNumber}`
    });

    return {
      message: "Detail arsip",
      data: {
        ...archive,
        files: archive.files.map((file) => ({
          ...file,
          sizeBytes: file.sizeBytes.toString()
        }))
      }
    };
  }

  async update(
    id: string,
    dto: UpdateArchiveDto,
    user?: { userId?: string; unitId?: string | null; roles?: string[] }
  ) {
    const existingArchive = await this.prisma.archive.findUnique({
      where: { id }
    });

    if (!existingArchive) {
      throw new NotFoundException("Arsip tidak ditemukan");
    }

    this.ensureUnitAccess(user || {}, existingArchive.createdByUnitId);

    if (dto.createdByUnitId) {
      const unit = await this.prisma.unit.findUnique({
        where: { id: dto.createdByUnitId }
      });

      if (!unit) {
        throw new BadRequestException("Unit tidak ditemukan");
      }

      if (!this.isPrivileged(user?.roles || [])) {
        if (dto.createdByUnitId !== user?.unitId) {
          throw new ForbiddenException("Anda tidak boleh memindahkan arsip ke unit lain");
        }
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
      userId: user?.userId,
      archiveId: archive.id,
      action: "UPDATE",
      entityType: "Archive",
      entityId: archive.id,
      description: `Memperbarui arsip ${archive.archiveNumber}`
    });

    return {
      message: "Arsip berhasil diperbarui",
      data: {
        ...archive,
        files: archive.files.map((file) => ({
          ...file,
          sizeBytes: file.sizeBytes.toString()
        }))
      }
    };
  }

  async remove(
    id: string,
    user?: { userId?: string; unitId?: string | null; roles?: string[] }
  ) {
    const existingArchive = await this.prisma.archive.findUnique({
      where: { id }
    });

    if (!existingArchive) {
      throw new NotFoundException("Arsip tidak ditemukan");
    }

    this.ensureUnitAccess(user || {}, existingArchive.createdByUnitId);

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
      userId: user?.userId,
      archiveId: archive.id,
      action: "DELETE",
      entityType: "Archive",
      entityId: archive.id,
      description: `Soft delete arsip ${archive.archiveNumber}`
    });

    return {
      message: "Arsip berhasil dihapus secara soft delete",
      data: {
        ...archive,
        files: archive.files.map((file) => ({
          ...file,
          sizeBytes: file.sizeBytes.toString()
        }))
      }
    };
  }

  async uploadFile(
    id: string,
    file: Express.Multer.File,
    user?: { userId?: string; unitId?: string | null; roles?: string[] }
  ) {
    const archive = await this.prisma.archive.findUnique({
      where: { id }
    });

    if (!archive) {
      throw new NotFoundException("Arsip tidak ditemukan");
    }

    this.ensureUnitAccess(user || {}, archive.createdByUnitId);

    if (!file) {
      throw new BadRequestException("File tidak ditemukan");
    }

    const uploadDir = "/root/arsip-pemerintahan/uploads/archives";

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const storedName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}${ext}`;
    const filePath = path.join(uploadDir, storedName);

    fs.writeFileSync(filePath, file.buffer);

    const checksumSha256 = crypto
      .createHash("sha256")
      .update(file.buffer)
      .digest("hex");

    const archiveFile = await this.prisma.archiveFile.create({
      data: {
        archiveId: id,
        originalName: file.originalname,
        storedName,
        mimeType: file.mimetype,
        sizeBytes: BigInt(file.size),
        storageKey: storedName,
        checksumSha256
      }
    });

    await this.auditLogsService.createLog({
      userId: user?.userId,
      archiveId: id,
      action: "UPLOAD",
      entityType: "ArchiveFile",
      entityId: archiveFile.id,
      description: `Upload file ${file.originalname} ke arsip ${archive.archiveNumber}`
    });

    return {
      message: "File berhasil diupload",
      data: {
        ...archiveFile,
        sizeBytes: archiveFile.sizeBytes.toString()
      }
    };
  }

  async downloadFile(
    archiveId: string,
    fileId: string,
    user?: { userId?: string; unitId?: string | null; roles?: string[] }
  ) {
    const archive = await this.prisma.archive.findUnique({
      where: { id: archiveId }
    });

    if (!archive) {
      throw new NotFoundException("Arsip tidak ditemukan");
    }

    this.ensureUnitAccess(user || {}, archive.createdByUnitId);

    const archiveFile = await this.prisma.archiveFile.findUnique({
      where: { id: fileId }
    });

    if (!archiveFile || archiveFile.archiveId !== archiveId) {
      throw new NotFoundException("File arsip tidak ditemukan");
    }

    const filePath = path.join(
      "/root/arsip-pemerintahan/uploads/archives",
      archiveFile.storedName
    );

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException("File fisik tidak ditemukan di server");
    }

    await this.auditLogsService.createLog({
      userId: user?.userId,
      archiveId,
      action: "DOWNLOAD",
      entityType: "ArchiveFile",
      entityId: archiveFile.id,
      description: `Download file ${archiveFile.originalName} dari arsip ${archive.archiveNumber}`
    });

    return {
      filePath,
      originalName: archiveFile.originalName,
      mimeType: archiveFile.mimeType
    };
  }
}
