import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelloController } from './hello/hello.controller';
import { AuthModule } from './auth/auth.module';
import { DoctorsModule } from './doctors/doctors.module';
import { SchedulesModule } from './schedules/schedules.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config available application-wide
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true, // Automatically load all entities
      synchronize: false, // DEV only: auto-creates schema. We'll replace this with migrations.
    }),
     DoctorsModule,
     SchedulesModule,
  ],
 controllers: [HelloController],
  providers: [],
})
export class AppModule {}
