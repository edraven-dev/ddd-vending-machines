import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const createSwaggerConfig = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Management API')
    .setDescription('The Management API description')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/management/docs', app, document);
};
