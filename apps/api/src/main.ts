import { apiReference } from '@scalar/nestjs-api-reference';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationFilter } from './interceptors/validation/validation.filter';
import fastifyCookie from '@fastify/cookie';
import multipart from 'fastify-multipart';
import { DBFilter } from './interceptors/db/db.filter';
import dotenv from 'dotenv';
import { patchNestJsSwagger } from 'nestjs-zod';
dotenv.config();
process.env.TZ = 'UTC';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      trustProxy: true,
      bodyLimit: 1024 * 1024 * 100, // 100MB
    }),
  );

  patchNestJsSwagger();

  //Protection
  app.enableCors({
    origin: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'],
    credentials: true,
  });
  app.useGlobalFilters(new ValidationFilter());
  app.useGlobalFilters(new DBFilter());

  //Middleware
  await app.register(fastifyCookie as any);
  await app.register(multipart);

  //Swagger implementation
  const config = new DocumentBuilder()
    .setTitle('Cstgrp')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/docs',
    apiReference({
      withFastify: true,
      hideClientButton: false,
      showSidebar: true,
      theme: 'none',
      layout: 'modern',
      isEditable: false,
      hideModels: false,
      hideDownloadButton: true,
      hideTestRequestButton: true,
      hideSearch: false,
      hideDarkModeToggle: false,
      withDefaultFonts: true,
      content: document,
    }),
  );

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}

bootstrap();
