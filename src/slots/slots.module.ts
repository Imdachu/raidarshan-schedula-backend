import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlotsController } from './slots.controller';
import { SlotsService } from './slots.service';
import { Slot } from '../slots/slot.entity';
import { DoctorSchedule } from '../schedules/schedule.entity';
import { Doctor } from '../doctors/doctor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Slot, DoctorSchedule, Doctor])],
  controllers: [SlotsController],
  providers: [SlotsService],
  exports: [SlotsService],
})
export class SlotsModule {}
