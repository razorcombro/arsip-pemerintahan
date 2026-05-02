import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
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

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        username: dto.username,
        passwordHash: hashedPassword,
        unitId: dto.unitId
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        username: true,
        unitId: true,
        createdAt: true
      }
    });

    return {
      message: "User berhasil dibuat",
      user
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username }
    });

    if (!user) {
      throw new UnauthorizedException("Username atau password salah");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Username atau password salah");
    }

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        username: user.username
      }
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        username: true,
        unitId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new UnauthorizedException("User tidak ditemukan");
    }

    return user;
  }
}
