import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import serverConfig from './config/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true, // Set to true if you need to include cookies or authentication
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  app.setGlobalPrefix('/api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        // enableImplicitConversion: true,
      },
      whitelist: false,
      forbidNonWhitelisted: true,
      exceptionFactory: (validationErrors = []) => {
        return new BadRequestException(
          validationErrors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
            value: error.value,
            children: error.children,
          })),
        );
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('BOUNTIP')
    .setDescription("The BOUNTIP's API Documentation.")
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'refresh-token',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
      },
      'api-key',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('api/docs', app, swaggerDocument);

  await app
    .listen(serverConfig.PORT)
    .then(() => console.log(`Server running on port ${serverConfig.PORT}`))
    .catch((err) => console.log(err));
}
bootstrap();
