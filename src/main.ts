import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   // Enable validation + transformation globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // allows @Transform decorators in DTOs to work
      whitelist: true, // optional: strips properties not in DTO
      forbidNonWhitelisted: false, // optional: throws error if extra properties are sent
    }),
  );
  await app.listen(3000);
}
bootstrap();
