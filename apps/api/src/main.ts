import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { BigIntSerializationInterceptor } from './common/interceptors/bigint-serialization.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: config.get('CORS_ORIGINS', 'http://localhost:3000').split(','),
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api', {
    exclude: ['health'],
  });

  // BigInt → Number serialization (Prisma BigInt fix)
  app.useGlobalInterceptors(new BigIntSerializationInterceptor());

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger
  if (config.get('APP_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('SIMRS Petala Bumi API')
      .setDescription('API untuk Sistem Informasi Manajemen Rumah Sakit RSUD Petala Bumi')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication & Authorization')
      .addTag('patients', 'Master Data Pasien')
      .addTag('practitioners', 'Master Data Dokter/Nakes')
      .addTag('encounters', 'Kunjungan / Registrasi')
      .addTag('pharmacy', 'Farmasi & Obat')
      .addTag('billing', 'Billing & Pembayaran')
      .addTag('laboratory', 'Laboratorium')
      .addTag('radiology', 'Radiologi')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = config.get('APP_PORT', 3001);
  await app.listen(port);
  console.log(`SIMRS Petala Bumi API running on port ${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
