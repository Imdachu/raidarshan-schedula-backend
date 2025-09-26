import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelloController } from './hello/hello.controller';
import { AuthModule } from './auth/auth.module';
import { DoctorsModule } from './doctors/doctors.module';
import { SchedulesModule } from './schedules/schedules.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { SlotsModule } from './slots/slots.module';
import { Appointment } from './appointments/appointment.entity';
import { Doctor } from './doctors/doctor.entity';
import { Patient } from './patients/patient.entity';
import { DoctorSchedule } from './schedules/schedule.entity';
import { Slot } from './slots/slot.entity';
import { User } from './users/user.entity';

@Module({
  imports: [
    AuthModule,
    DoctorsModule,
    SchedulesModule,
    AppointmentsModule,
    SlotsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const nodeEnv = config.get('NODE_ENV');
        const databaseUrl = config.get<string>('DATABASE_URL');

        console.log('🌍 NODE_ENV:', nodeEnv);
        console.log('🔗 DATABASE_URL:', databaseUrl ? 'Loaded ✅' : 'Not Found ❌');

        if (nodeEnv === 'production') {
          return {
            type: 'postgres',
            url: databaseUrl, // Render's database URL
            entities: [Appointment, Doctor, Patient, DoctorSchedule, Slot, User],
            synchronize: false, // Never auto-sync in production
            ssl: { rejectUnauthorized: false }, // Required for Render
          };
        }

        // Local development
        console.log('⚠️ Using local DB config:', {
          host: config.get('DB_HOST') || '127.0.0.1',
          port: config.get('DB_PORT') || 5432,
          username: config.get('DB_USERNAME'),
          database: config.get('DB_DATABASE'),
        });

        return {
          type: 'postgres',
          host: config.get('DB_HOST') || '127.0.0.1',
          port: parseInt(config.get('DB_PORT'), 10) || 5432,
          username: config.get('DB_USERNAME'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_DATABASE'),
          entities: [Appointment, Doctor, Patient, DoctorSchedule, Slot, User],
          synchronize: true, // Only for local dev
        };
      },
    }),
  ],
  controllers: [HelloController],
  providers: [],
})
export class AppModule {}
