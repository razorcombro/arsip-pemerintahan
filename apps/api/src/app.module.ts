import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ArchivesModule } from "./modules/archives/archives.module";
import { AuditLogsModule } from "./modules/audit-logs/audit-logs.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "../../.env"
    }),
    PrismaModule,
    AuthModule,
    ArchivesModule,
    AuditLogsModule,
    UsersModule
  ],
  controllers: [AppController]
})
export class AppModule {}
