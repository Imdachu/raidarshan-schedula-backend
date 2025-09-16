import { Doctor } from '../doctors/doctor.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

export enum WaveMode {
  SYSTEM = 'system',
  DOCTOR = 'doctor',
}

@Entity('doctor_schedules')
export class DoctorSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Column({ type: 'date' })
  date: string;

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