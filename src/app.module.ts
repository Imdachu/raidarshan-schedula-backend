import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelloController } from './hello/hello.controller';
import { AuthModule } from './auth/auth.module';
import { DoctorsModule } from './doctors/doctors.module';
import { SchedulesModule } from './schedules/schedules.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { SlotsModule } from './slots/slots.module';
import { dataSourceOptions } from '../data-source'; // <-- Import the unified config

@Module({
  imports: [
    AuthModule,
    DoctorsModule,
    SchedulesModule,
    AppointmentsModule,
    SlotsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Use the imported configuration directly. This ensures 100% consistency.
    TypeOrmModule.forRoot(dataSourceOptions),
  ],
  controllers: [HelloController],
  providers: [],
})
export class AppModule {}