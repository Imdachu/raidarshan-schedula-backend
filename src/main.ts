import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SeederService } from './seeder/seeder.service';

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const dataSource = app.get(DataSource);
  await dataSource.runMigrations();
  console.log('✅ Migrations have been successfully executed.');

  // --- 2. Run Seeder on Startup ---
  const seeder = app.get(SeederService);
  await seeder.seed();
  console.log('✅ Seeding has been successfully completed.');

   // Enable validation + transformation globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // allows @Transform decorators in DTOs to work
      whitelist: true, // optional: strips properties not in DTO
      forbidNonWhitelisted: false, // optional: throws error if extra properties are sent
    }),
  );
  await app.listen(process.env.PORT ||3000);
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
}
bootstrap();
