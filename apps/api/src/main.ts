import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || "*"
  });

  const port = Number(process.env.PORT || 4000);
  const prefix = process.env.API_PREFIX || "api";

  app.setGlobalPrefix(prefix);

  await app.listen(port);

  console.log(`API berjalan di http://localhost:${port}/${prefix}`);
}

bootstrap();