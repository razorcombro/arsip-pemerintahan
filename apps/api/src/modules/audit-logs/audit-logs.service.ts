import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(data: {
    userId?: string;
    archiveId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    description?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        archiveId: data.archiveId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        description: data.description
      }
    });
  }
}
