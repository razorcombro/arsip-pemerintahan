import {
  BadRequestException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });

    if (existingEmail) {
      throw new BadRequestException("Email sudah digunakan");
    }

    const existingUsername = await this.prisma.user.findUnique({
      where: { username: dto.username }
    });

    if (existingUsername) {
      throw new BadRequestException("Username sudah digunakan");
    }

    if (dto.unitId) {
      const unit = await this.prisma.unit.findUnique({
        where: { id: dto.unitId }
      });

      if (!unit) {
        throw new NotFoundException("Unit tidak ditemukan");
      }
    }

    let role = null;

    if (dto.roleCode) {
      role = await this.prisma.role.findUnique({
        where: { code: dto.roleCode }
      });

      if (!role) {
        throw new NotFoundException("Role tidak ditemukan");
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        username: dto.username,
        passwordHash: hashedPassword,
        unitId: dto.unitId
      }
    });

    if (role) {
      await this.prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id
        }
      });
    }

    const createdUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        unit: true,
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    return {
      message: "User berhasil dibuat",
      data: {
        id: createdUser?.id,
        fullName: createdUser?.fullName,
        email: createdUser?.email,
        username: createdUser?.username,
        unitId: createdUser?.unitId,
        unit: createdUser?.unit,
        roles: createdUser?.roles.map((item) => item.role.code) || [],
        createdAt: createdUser?.createdAt
      }
    };
  }

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
