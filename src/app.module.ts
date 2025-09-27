import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
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
import { SeederModule } from './seeder/seeder.module'; // <-- Import SeederModule

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
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const nodeEnv = config.get('NODE_ENV');
        const databaseUrl = config.get<string>('DATABASE_URL');
        if (nodeEnv === 'production') {
          if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is not set for production!');
          }
          return {
            type: 'postgres',
            url: databaseUrl,
            schema: 'public', 
            entities: [Appointment, Doctor, Patient, DoctorSchedule, Slot, User],
            migrations: [__dirname + '/../migrations/*{.ts,.js}'], // Reliable path
            synchronize: false,
            ssl: { rejectUnauthorized: false },
          };
        }
        // Local development config...
        return {
          type: 'postgres',
          host: config.get('DB_HOST') || '127.0.0.1',
          port: parseInt(config.get('DB_PORT'), 10) || 5432,
          username: config.get('DB_USERNAME'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_DATABASE'),
          entities: [Appointment, Doctor, Patient, DoctorSchedule, Slot, User],
          migrations: [__dirname + '/../migrations/*{.ts,.js}'], // Reliable path
          migrationsRun: true,
          synchronize: false, 
          logging: ['query', 'error', 'schema'],
        };
      },
    }),
  ],
  controllers: [HelloController],
  providers: [],
})
export class AppModule {}