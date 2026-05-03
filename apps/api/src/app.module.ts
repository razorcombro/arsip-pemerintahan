import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ArchivesModule } from "./modules/archives/archives.module";
import { AuditLogsModule } from "./modules/audit-logs/audit-logs.module";
import { UsersModule } from "./modules/users/users.module";
import { UnitsModule } from "./modules/units/units.module";
import { ClassificationsModule } from "./modules/classifications/classifications.module";
import { StatsModule } from "./modules/stats/stats.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env", ".env"]
    }),
    PrismaModule,
    AuthModule,
    ArchivesModule,
    AuditLogsModule,
    UsersModule,
    UnitsModule,
    ClassificationsModule,
    StatsModule
  ],
  controllers: [AppController]
})
export class AppModule {}
