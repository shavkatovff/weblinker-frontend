import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { urlencoded } from 'express';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from './app.module';

// .env yoki tizim TZ bo‘lmasa — server vaqti Asia/Tashkent
process.env.TZ ??= 'Asia/Tashkent';

async function bootstrap() {
  const uploadRoot = join(process.cwd(), 'uploads');
  if (!existsSync(uploadRoot)) {
    mkdirSync(uploadRoot, { recursive: true });
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  /** CLICK Prepare/Complete odatda application/x-www-form-urlencoded yuboradi */
  app.use(urlencoded({ extended: true, limit: '256kb' }));
  const frontendOrigins = process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:8000'];
  app.enableCors({ origin: frontendOrigins, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      /** CLICK prepare/complete da klassifikatsiyasiz body — forbid ko‘p webhookni sindiradi */
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  const port = Number(process.env.API_PORT) || Number(process.env.PORT) || 8001;
  await app.listen(port);
}
bootstrap();
