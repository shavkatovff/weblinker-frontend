import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { urlencoded } from 'express';
import { AppModule } from './app.module';

// .env yoki tizim TZ bo‘lmasa — server vaqti Asia/Tashkent
process.env.TZ ??= 'Asia/Tashkent';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /** CLICK Prepare/Complete odatda application/x-www-form-urlencoded yuboradi */
  app.use(urlencoded({ extended: true, limit: '256kb' }));
  const frontendOrigins = process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000'];
  app.enableCors({ origin: frontendOrigins, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const port = Number(process.env.API_PORT) || Number(process.env.PORT) || 3001;
  await app.listen(port);
}
bootstrap();
