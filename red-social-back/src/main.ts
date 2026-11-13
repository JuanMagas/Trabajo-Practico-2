import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import * as dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, stopAtFirstError: true }));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, stopAtFirstError: true }));
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();