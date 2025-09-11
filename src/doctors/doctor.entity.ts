import { User } from '../users/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  specialty: string;


  @Column({ type: 'int', nullable: true, default: 0 }) 
  experience: number; 

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}