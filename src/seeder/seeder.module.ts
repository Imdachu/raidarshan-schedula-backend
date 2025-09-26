import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Doctor } from '../doctors/doctor.entity';
import { Patient } from '../patients/patient.entity';
import { SeederService } from './seeder.service';
import { User } from '../users/user.entity';
import { Appointment } from '../appointments/appointment.entity';
import { DoctorSchedule } from '../schedules/schedule.entity';
import { Slot } from '../slots/slot.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get('NODE_ENV') === 'production';
        const databaseUrl = config.get<string>('DATABASE_URL');

        if (isProd) {
          if (!databaseUrl) {
            throw new Error('DATABASE_URL is not set in production environment for seeder');
          }
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [Doctor, Patient, User, Appointment, DoctorSchedule, Slot],
            synchronize: false, // Seeder should not sync schema
            ssl: { rejectUnauthorized: false },
          };
        }

        // Local development seeder config
        return {
          type: 'postgres',
          host: config.get('DB_HOST'),
          port: parseInt(config.get('DB_PORT'), 10),
          username: config.get('DB_USERNAME'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_DATABASE'),
          entities: [Doctor, Patient, User, Appointment, DoctorSchedule, Slot],
          synchronize: true,
        };
      },
    }),
    TypeOrmModule.forFeature([Doctor, Patient, User, Appointment, DoctorSchedule, Slot]),
  ],
  providers: [SeederService],
})
export class SeederModule {}