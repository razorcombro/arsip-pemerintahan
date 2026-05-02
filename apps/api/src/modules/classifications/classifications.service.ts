import {
  BadRequestException,
  Injectable
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateClassificationDto } from "./dto/create-classification.dto";

@Injectable()
export class ClassificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClassificationDto) {
    const existingClassification = await this.prisma.classification.findUnique({
      where: { code: dto.code }
    });

    if (existingClassification) {
      throw new BadRequestException("Kode klasifikasi sudah digunakan");
    }

    const classification = await this.prisma.classification.create({
      data: {
        code: dto.code,
        name: dto.name,
        activeRetention: dto.activeRetention,
        inactiveRetention: dto.inactiveRetention
      }
    });

    return {
      message: "Klasifikasi berhasil dibuat",
      data: classification
    };
  }

  async findAll() {
    const classifications = await this.prisma.classification.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    return {
      message: "Daftar klasifikasi",
      data: classifications
    };
  }
}
