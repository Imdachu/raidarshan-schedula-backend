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

// --- DEBUGGING STATEMENT ---
// We cast to `any` here just for the debug log to safely access the url property.
const logOptions = dataSourceOptions as any;
console.log("--- [DEBUG] LIVE APPLICATION CONFIG ---");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Connection method:", logOptions.url ? `URL (${logOptions.url.substring(0, 25)}...)` : "Host/Port");
console.log("Entities Path:", logOptions.entities);
console.log("Migrations Path:", logOptions.migrations);
console.log("---------------------------------------");
// --- END DEBUGGING ---

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
    // Use the imported configuration directly
    TypeOrmModule.forRoot(dataSourceOptions),
  ],
  controllers: [HelloController],
  providers: [],
})
export class AppModule {}