import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorSchedule } from './schedule.entity';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { Doctor } from '../doctors/doctor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorSchedule, Doctor])],
  controllers: [SchedulesController],
  providers: [SchedulesService],
})
export class SchedulesModule {}