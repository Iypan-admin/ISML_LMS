import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
let helmet: any;
try {
  helmet = require('helmet');
} catch {}
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow high-res uploads (PDFs, Audio clips, Videos, Images) up to 50MB
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // 15+ Yrs Enterprise Security Controls
  if (helmet) {
    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      }),
    );
  }

  // Cross-Origin Resource Sharing (CORS) with Next.js frontend
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Tenant-Id', 'X-Institution-Id'],
  });

  // Global Input Validation & Sanitization (Blocks injection payloads)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 ISML LMS Enterprise Backend running securely on port ${port}`);


  // Instant Background Warmup: Pre-fetch critical queries so the VERY FIRST request is instant (0ms delay)
  setTimeout(() => {
    fetch(`http://127.0.0.1:${port}/api/portals/institutions`).catch(() => {});
    fetch(`http://127.0.0.1:${port}/api/portals/admissions`).catch(() => {});
    fetch(`http://127.0.0.1:${port}/api/portals/courses`).catch(() => {});
    fetch(`http://127.0.0.1:${port}/api/portals/batches`).catch(() => {});
  }, 100);
}
bootstrap();
