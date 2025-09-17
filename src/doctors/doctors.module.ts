import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './doctor.entity';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';
import { SchedulesModule } from '../schedules/schedules.module'; 

@Module({
  imports: [TypeOrmModule.forFeature([Doctor]), SchedulesModule],
  controllers: [DoctorsController],
  providers: [DoctorsService],
})
export class DoctorsModule {}