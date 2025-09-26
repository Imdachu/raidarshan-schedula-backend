import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slot } from './slot.entity';
import { DoctorSchedule, WaveMode } from '../schedules/schedule.entity';
import { Doctor } from '../doctors/doctor.entity';
import { CreateManualSlotsDto } from './dto/create-manual-slots.dto';

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Slot)
    private readonly slotRepository: Repository<Slot>,
    @InjectRepository(DoctorSchedule)
    private readonly scheduleRepository: Repository<DoctorSchedule>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async createManualSlots(doctorId: string, dto: CreateManualSlotsDto) {
    const doctor = await this.doctorRepository.findOne({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    let schedule = await this.scheduleRepository.findOne({ where: { doctor: { id: doctorId }, date: dto.date } });
    if (!schedule) {
      schedule = this.scheduleRepository.create({ doctor, date: dto.date, wave_mode: WaveMode.DOCTOR });
      await this.scheduleRepository.save(schedule);
    } else if (schedule.wave_mode === WaveMode.SYSTEM) {
      throw new BadRequestException('Cannot add manual slots to a system-generated schedule');
    }

    // Prevent overlapping slots
    const newSlots = dto.slots.map(slotDto => {
      const dateStr = dto.date.replace(/-/g, ''); // '2025-09-25' -> '20250925'
      // Only take HHmm from startTime (e.g., '14:00:00' -> '1400')
      const timeStr = slotDto.startTime.replace(':', '').substring(0, 4);
      const slot_id_composite = `${doctorId}-${dateStr}-${timeStr}`;
      const slot = this.slotRepository.create({
        start_time: slotDto.startTime,
        end_time: slotDto.endTime,
        capacity: slotDto.capacity,
        schedule,
        slot_id_composite,
      });
      return slot;
    });

    // Fetch existing slots for overlap check
    const existingSlots = await this.slotRepository.find({ where: { schedule: { id: schedule.id } } });
    for (const newSlot of newSlots) {
      for (const existing of existingSlots) {
        if (
          (newSlot.start_time < existing.end_time && newSlot.end_time > existing.start_time)
        ) {
          throw new BadRequestException('Overlapping slot detected');
        }
      }
    }

    const savedSlots = await this.slotRepository.save(newSlots);
    return savedSlots;
  }
}
