import { DoctorSchedule } from '../schedules/schedule.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('slots')
export class Slot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DoctorSchedule)
  @JoinColumn({ name: 'schedule_id' })
  schedule: DoctorSchedule;

  @Column()
  slot_id_composite: string;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column()
  capacity: number;

  @Column({ default: 0 })
  booked_count: number;
}