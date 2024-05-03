import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const createSwaggerConfig = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('ATM API')
    .setDescription('The ATM API description')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/atm/docs', app, document);
};
