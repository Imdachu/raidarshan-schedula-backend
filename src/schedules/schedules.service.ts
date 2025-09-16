import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorSchedule } from './schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { Doctor } from '../doctors/doctor.entity';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(DoctorSchedule)
    private readonly scheduleRepository: Repository<DoctorSchedule>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async create(
    doctorId: string,
    createScheduleDto: CreateScheduleDto,
  ): Promise<DoctorSchedule> {
    const doctor = await this.doctorRepository.findOne({ where: { id: doctorId } });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID "${doctorId}" not found`);
    }

    const newSchedule = this.scheduleRepository.create({
      doctor: doctor,
      date: createScheduleDto.date,
      consulting_start: createScheduleDto.consultingStart,
      consulting_end: createScheduleDto.consultingEnd,       
      wave_mode: createScheduleDto.waveMode,
      slot_duration: createScheduleDto.slotDuration,         
      capacity_per_slot: createScheduleDto.capacityPerSlot,   
    });

    return this.scheduleRepository.save(newSchedule);
  }
}