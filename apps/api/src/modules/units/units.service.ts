import {
  BadRequestException,
  Injectable
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateUnitDto } from "./dto/create-unit.dto";

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUnitDto) {
    const existingUnit = await this.prisma.unit.findUnique({
      where: { code: dto.code }
    });

    if (existingUnit) {
      throw new BadRequestException("Kode unit sudah digunakan");
    }

    const unit = await this.prisma.unit.create({
      data: {
        code: dto.code,
        name: dto.name
      }
    });

    return {
      message: "Unit berhasil dibuat",
      data: unit
    };
  }

  async findAll() {
    const units = await this.prisma.unit.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    return {
      message: "Daftar unit",
      data: units
    };
  }
}
