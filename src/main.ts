import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Runs DTO validation for every request; also strips unknown fields and converts basic types.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger = interactive API docs (try endpoints) at GET /api.
  const swagger = new DocumentBuilder()
    .setTitle('Thmanyah API')
    .setDescription(
      'CMS: create/update/delete under /cms/programs. Public: /programs and /programs/search. Duration is in seconds.',
    )
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, swagger));

  // Starts the HTTP server (PORT env var or 3000).
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
