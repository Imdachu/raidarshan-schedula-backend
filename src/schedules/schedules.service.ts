import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorSchedule } from './schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { Doctor } from '../doctors/doctor.entity';
import { Appointment } from '../appointments/appointment.entity';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(DoctorSchedule)
    private readonly scheduleRepository: Repository<DoctorSchedule>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Appointment) // <-- 2. Inject Appointment Repository
    private readonly appointmentRepository: Repository<Appointment>,
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
  async findAvailableSlots(doctorId: string, date: string) {
    const schedule = await this.scheduleRepository.findOne({
      where: { doctor: { id: doctorId }, date },
    });

    if (!schedule) {
      return {
        doctorId,
        date,
        slots: [], // No schedule found for this day
      };
    }

    // Logic to generate slots
    const slots = [];
    const { consulting_start, consulting_end, slot_duration, capacity_per_slot } = schedule;

    let currentTime = new Date(`${date}T${consulting_start}`);
    const endTime = new Date(`${date}T${consulting_end}`);

    while (currentTime < endTime) {
      const slotStartTime = currentTime;
      const slotEndTime = new Date(slotStartTime.getTime() + slot_duration * 60000);

      const startTimeString = slotStartTime.toTimeString().substring(0, 5);
      const endTimeString = slotEndTime.toTimeString().substring(0, 5);
      
      // Count existing appointments for this slot
      const bookedCount = await this.appointmentRepository.count({
        where: {
          doctor: { id: doctorId },
          assigned_time: startTimeString,
          // You might need to add a date check here in the future if appointments span multiple days
        },
      });

      const available = capacity_per_slot - bookedCount;

      slots.push({
        slotId: `d${doctorId}-${date.replace(/-/g, '')}-${startTimeString.replace(':', '')}`,
        startTime: startTimeString,
        endTime: endTimeString,
        capacity: capacity_per_slot,
        available: available > 0 ? available : 0,
      });

      currentTime = slotEndTime;
    }

    return {
      doctorId,
      date,
      scheduleType: 'wave',
      waveMode: schedule.wave_mode,
      slots,
    };
  }
}
