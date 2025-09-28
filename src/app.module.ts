import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { HelloController } from './hello/hello.controller';
import { AuthModule } from './auth/auth.module';
import { DoctorsModule } from './doctors/doctors.module';
import { SchedulesModule } from './schedules/schedules.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { SlotsModule } from './slots/slots.module';

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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProd = configService.get('NODE_ENV') === 'production';

        let options: TypeOrmModuleOptions;

        if (isProd) {
          // In production, we ONLY use the DATABASE_URL provided by Render.
          // This is the most important change.
          options = {
            type: 'postgres',
            url: configService.get<string>('DATABASE_URL'),
            schema: 'public',
            entities: [__dirname + '/**/*.entity{.js,.ts}'],
            synchronize: false,
            ssl: {
              rejectUnauthorized: false,
            },
          };
        } else {
          // Local development configuration
          options = {
            type: 'postgres',
            host: configService.get('DB_HOST'),
            port: parseInt(configService.get('DB_PORT'), 10),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_DATABASE'),
            schema: 'public',
            entities: [__dirname + '/**/*.entity{.js,.ts}'],
            synchronize: false,
          };
        }

        // --- FINAL DEBUGGING LOG ---
        console.log("--- [FINAL DEBUG] LIVE APP DB CONFIG ---");
        console.log("NODE_ENV:", process.env.NODE_ENV);
        // We cast to `any` for logging to avoid TypeScript errors
        const logOpts = options as any;
        console.log("Connection Method:", logOpts.url ? "URL" : "Host/Port");
        console.log("--------------------------------------");

        return options;
      },
    }),
  ],
  controllers: [HelloController],
  providers: [],
})
export class AppModule {}