import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get the DataSource instance from the app
  const dataSource = app.get(DataSource);
  
  // Run migrations on startup
  console.log('--- RUNNING MIGRATIONS ---');
  await dataSource.runMigrations();
  console.log('--- MIGRATIONS FINISHED ---');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Use the PORT environment variable provided by Render
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on port: ${port}`);
}
bootstrap();