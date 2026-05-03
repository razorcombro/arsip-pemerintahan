import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalUnits,
      totalClassifications,
      totalArchives,
      totalFiles,
      archivesByStatus
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.unit.count(),
      this.prisma.classification.count(),
      this.prisma.archive.count(),
      this.prisma.archiveFile.count(),
      this.prisma.archive.groupBy({
        by: ["status"],
        _count: {
          status: true
        }
      })
    ]);

    const statusMap = {
      DRAFT: 0,
      ACTIVE: 0,
      INACTIVE: 0,
      DESTROYED: 0
    };

    for (const item of archivesByStatus) {
      const key = item.status as keyof typeof statusMap;
      if (key in statusMap) {
        statusMap[key] = item._count.status;
      }
    }

    return {
      message: "Statistik dashboard",
      data: {
        totalUsers,
        totalUnits,
        totalClassifications,
        totalArchives,
        totalFiles,
        archivesByStatus: statusMap
      }
    };
  }
}
