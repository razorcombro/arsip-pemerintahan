import {
  BadRequestException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async assignRole(userId: string, roleCode: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundException("User tidak ditemukan");
    }

    const role = await this.prisma.role.findUnique({
      where: { code: roleCode }
    });

    if (!role) {
      throw new NotFoundException("Role tidak ditemukan");
    }

    const existingUserRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        roleId: role.id
      }
    });

    if (existingUserRole) {
      throw new BadRequestException("Role tersebut sudah dimiliki user");
    }

    await this.prisma.userRole.create({
      data: {
        userId,
        roleId: role.id
      }
    });

    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    return {
      message: "Role berhasil ditambahkan ke user",
      data: {
        id: updatedUser?.id,
        fullName: updatedUser?.fullName,
        email: updatedUser?.email,
        username: updatedUser?.username,
        unitId: updatedUser?.unitId,
        roles: updatedUser?.roles.map((item) => item.role.code) || []
      }
    };
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: {
        unit: true,
        roles: {
          include: {
            role: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return {
      message: "Daftar user",
      data: users.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        unitId: user.unitId,
        unit: user.unit,
        roles: user.roles.map((item) => item.role.code),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    };
  }
}
