import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// import { DataSource } from 'typeorm';
// import * as bcrypt from 'bcrypt';
// import { User } from './users/user.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const dataSource = app.get(DataSource);

  // // --- Step 1: Run Migrations ---
  // // This creates the tables. The log shows this part is now working.
  // await dataSource.runMigrations();
  // console.log('✅ Migrations have been successfully executed.');

  // // --- Step 2: Manually Seed the Admin User ---
  // // This is the new, robust seeding logic.
  // const userRepo = dataSource.getRepository('users');
  // const adminExists = await userRepo.findOne({ where: { email: 'admin@schedula.com' } });

  // if (!adminExists) {
  //   console.log('Admin user not found, creating one...');
  //   const salt = await bcrypt.genSalt();
  //   const hashedPassword = await bcrypt.hash('AdminPassword123', salt);

  //   // We use a raw query to bypass any potential service/repository issues.
  //   await dataSource.query(
  //     `INSERT INTO "users" (name, email, password_hash, role, provider, is_verified) VALUES ($1, $2, $3, $4, $5, $6)`,
  //     ['Admin User', 'admin@schedula.com', hashedPassword, 'admin', 'email', true]
  //   );
  //   console.log('✅ Admin user has been successfully seeded.');
  // } else {
  //   console.log('Admin user already exists. Skipping seed.');
  // }

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
}
bootstrap();