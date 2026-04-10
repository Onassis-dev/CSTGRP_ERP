import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationFilter } from './interceptors/validation/validation.filter';
import fastifyCookie from '@fastify/cookie';
import multipart from 'fastify-multipart';
import { DBFilter } from './interceptors/db/db.filter';
import dotenv from 'dotenv';
import './utils/crons';

dotenv.config();
process.env.TZ = 'UTC';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      trustProxy: true,
    }),
  );

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

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}

bootstrap();
