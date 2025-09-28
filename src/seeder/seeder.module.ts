import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from '../doctors/doctor.entity';
import { Patient } from '../patients/patient.entity';
import { SeederService } from './seeder.service';
import { SeederController } from './seeder.controller';
import { User } from '../users/user.entity'; 
import { Appointment } from '../appointments/appointment.entity';
import { DoctorSchedule } from '../schedules/schedule.entity';
import { Slot } from '../slots/slot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor, Patient, User, Appointment, DoctorSchedule, Slot]),
  ],
  controllers: [SeederController],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}