import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum ScheduleType {
  WAVE = 'wave',
  STREAM = 'stream',
}

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  specialization: string;

  @Column()
  location: string;

  @Column({
    type: 'enum',
    enum: ScheduleType,
  })
  schedule_type: ScheduleType;
}