import { Doctor } from '../doctors/doctor.entity';
import { Patient } from '../patients/patient.entity';
import { Slot } from '../slots/slot.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AppointmentStatus {
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Slot, { nullable: true })
  @JoinColumn({ name: 'slot_id' })
  slot: Slot;


  @Column({ type: 'date', nullable: false })
  assigned_date: string;

  @Column({ type: 'time', nullable: true })
  assigned_time: string;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.CONFIRMED,
  })
  status: AppointmentStatus;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}