import { Appointment } from '../appointments/appointment.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  contact: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' }) 
  user: User;
}