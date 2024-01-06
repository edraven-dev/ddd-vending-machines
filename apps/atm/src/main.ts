import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'node:path';

import { AppModule } from './app/app.module';
import { createSwaggerConfig } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.enableShutdownHooks();

  if (process.env.NODE_ENV === 'development') {
    createSwaggerConfig(app);
  }

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.GRPC,
      options: { package: 'atm', protoPath: join(__dirname, 'assets/atm/atm.proto'), url: 'localhost:50051' },
    },
    { inheritAppConfig: true },
  );
  await app.startAllMicroservices();
  const port = process.env.PORT || 3100;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
