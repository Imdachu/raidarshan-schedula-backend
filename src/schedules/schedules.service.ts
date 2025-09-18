// Helper to pad time strings to HH:mm:ss
function padTimeString(time: string): string {
  if (!time) return '00:00:00';
  const [h = '00', m = '00', s = '00'] = time.split(':');
  return [h.padStart(2, '0'), m.padStart(2, '0'), s.padStart(2, '0')].join(':');
}
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

    // One-off schedule: date is provided, weekdays is not
    if (createScheduleDto.date && (!createScheduleDto.weekdays || createScheduleDto.weekdays.length === 0)) {
      // Validate consultingStart < consultingEnd
      const newStart = Date.parse(`1970-01-01T${padTimeString(createScheduleDto.consultingStart)}`);
      const newEnd = Date.parse(`1970-01-01T${padTimeString(createScheduleDto.consultingEnd)}`);
      if (isNaN(newStart) || isNaN(newEnd)) {
        throw new BadRequestException('Invalid time format for consultingStart or consultingEnd.');
      }
      if (newStart >= newEnd) {
        throw new BadRequestException('consultingStart must be less than consultingEnd.');
      }
      // Validate slotDuration is not greater than the available time window
      const availableMinutes = (newEnd - newStart) / (1000 * 60);
      if (createScheduleDto.slotDuration > availableMinutes) {
        throw new BadRequestException('slotDuration cannot be greater than the time between consultingStart and consultingEnd.');
      }

      // Find all schedules for this doctor on the same date
      const existingSchedules = await this.scheduleRepository.find({
        where: {
          doctor: { id: doctorId },
          date: createScheduleDto.date,
        },
      });

      for (const sched of existingSchedules) {
        // Exact match
        if (
          sched.consulting_start === createScheduleDto.consultingStart &&
          sched.consulting_end === createScheduleDto.consultingEnd &&
          sched.wave_mode === createScheduleDto.waveMode
        ) {
          throw new BadRequestException('A schedule already exists for this doctor on this date and time slot.');
        }
        // Overlap check (pad time strings to HH:mm:ss before parsing)
        const existStart = Date.parse(`1970-01-01T${padTimeString(sched.consulting_start)}`);
        const existEnd = Date.parse(`1970-01-01T${padTimeString(sched.consulting_end)}`);
        // Only check overlap for same wave_mode
        if (sched.wave_mode === createScheduleDto.waveMode) {
          if (
            (newStart < existEnd && newEnd > existStart) // overlap
          ) {
            throw new BadRequestException('This time range overlaps with an existing schedule for this doctor on this date.');
          }
        }
      }
    }

    const newSchedule = this.scheduleRepository.create({
      doctor: doctor,
      date: createScheduleDto.date,
      weekdays: createScheduleDto.weekdays,
      consulting_start: createScheduleDto.consultingStart,
      consulting_end: createScheduleDto.consultingEnd,       
      wave_mode: createScheduleDto.waveMode,
      slot_duration: createScheduleDto.slotDuration,         
      capacity_per_slot: createScheduleDto.capacityPerSlot,   
    });

    return this.scheduleRepository.save(newSchedule);
  }
}