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
  async findAvailableSlots(doctorId: string, date: string) {
    // 1. Find all schedules for this doctor that apply to the date
    // a) One-off schedules for this date
    const oneOffSchedules = await this.scheduleRepository.find({
      where: { doctor: { id: doctorId }, date },
    });

    // b) Recurring schedules for the weekday of this date
    const weekday = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    // Weekday enum is lowercase (e.g., 'monday')
    const recurringSchedules = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoin('schedule.doctor', 'doctor')
      .where('doctor.id = :doctorId', { doctorId })
      .andWhere(':weekday = ANY(schedule.weekdays)', { weekday })
      .getMany();

    const allSchedules = [...oneOffSchedules, ...recurringSchedules];
    if (allSchedules.length === 0) {
      return {
        doctorId,
        date,
        slots: [],
      };
    }

    // 2. Generate slots for each schedule
    const slots = [];
    for (const schedule of allSchedules) {
      const { consulting_start, consulting_end, slot_duration, capacity_per_slot, id: scheduleId, wave_mode } = schedule;
      let currentTime = new Date(`${date}T${consulting_start}`);
      const endTime = new Date(`${date}T${consulting_end}`);
      while (currentTime < endTime) {
        const slotStartTime = currentTime;
        const slotEndTime = new Date(slotStartTime.getTime() + slot_duration * 60000);
        // Only add slot if it fits completely within consulting_end
        if (slotEndTime <= endTime) {
          const startTimeString = slotStartTime.toTimeString().substring(0, 5);
          const endTimeString = slotEndTime.toTimeString().substring(0, 5);
          // Count existing appointments for this slot
          const bookedCount = await this.appointmentRepository.count({
            where: {
              doctor: { id: doctorId },
              assigned_time: startTimeString,
              // Add date check if needed
            },
          });
          const available = capacity_per_slot - bookedCount;
          slots.push({
            slotId: `${doctorId}-${date.replace(/-/g, '')}-${startTimeString.replace(':', '')}`,
            startTime: startTimeString,
            endTime: endTimeString,
            capacity: capacity_per_slot,
            available: available > 0 ? available : 0,
            scheduleType: schedule.date ? 'one-off' : 'recurring',
            waveMode: wave_mode,
          });
        }
        currentTime = slotEndTime;
      }
    }
    // 3. Return all slots combined
    return {
      doctorId,
      date,
      slots,
    };
  }
}
