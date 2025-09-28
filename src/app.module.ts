import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
        if (isProd) {
          return {
            type: 'postgres',
            url: configService.get<string>('DATABASE_URL'),
            schema: 'public',
            entities: [__dirname + '/**/*.entity{.js,.ts}'],
            synchronize: false,
            ssl: { rejectUnauthorized: false },
          };
        }
        // Local development config
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: parseInt(configService.get('DB_PORT'), 10),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [__dirname + '/**/*.entity{.js,.ts}'],
          synchronize: false,
        };
      },
    }),
  ],
  controllers: [HelloController],
  providers: [],
})
export class AppModule {}