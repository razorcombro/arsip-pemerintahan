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

  async findAll() {
    const logs = await this.prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true
          }
        },
        archive: {
          select: {
            id: true,
            archiveNumber: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 200
    });

    return {
      message: "Daftar audit log",
      data: logs
    };
  }
}
