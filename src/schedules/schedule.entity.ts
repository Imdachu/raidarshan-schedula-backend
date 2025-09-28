import { Doctor } from '../doctors/doctor.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Check } from 'typeorm';

export enum WaveMode {
  SYSTEM = 'system',
  DOCTOR = 'doctor',
}

export enum Weekday {
  SUNDAY = 'sunday',
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
}

@Entity('doctor_schedules')
@Check(`"date" IS NOT NULL OR "weekdays" IS NOT NULL`)
@Check(`"date" IS NULL OR "weekdays" IS NULL`)
export class DoctorSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Column({ type: 'date', nullable: true })
  date: string;

  @Column({
    type: 'enum',
    enum: Weekday,
    array: true, // This tells PostgreSQL to store it as an array of enums
    nullable: true,
  })
  weekdays: Weekday[]; // Now it's an array of Weekday enums

  @Column({ type: 'enum', enum: WaveMode, nullable: true })
  wave_mode: WaveMode;

  @Column({ type: 'time', nullable: true })
  consulting_start: string;

  @Column({ type: 'time', nullable: true })
  consulting_end: string;

  @Column({ nullable: true })
  slot_duration: number; // in minutes

  @Column({ nullable: true })
  capacity_per_slot: number;

  @Column({ nullable: true })
  total_capacity: number;
}