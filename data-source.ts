import { DataSource } from 'typeorm';
import { config } from 'dotenv';
// import { User } from './src/users/user.entity';
// import { Doctor } from './src/doctors/doctor.entity';
// import { Patient } from './src/patients/patient.entity';
// import { Appointment } from './src/appointments/appointment.entity';
// import { DoctorSchedule } from './src/schedules/schedule.entity'; 
// import { Slot } from './src/slots/slot.entity'

config();

const isProd = process.env.NODE_ENV === 'production';

export default new DataSource({
  type: 'postgres',
  url: isProd ? process.env.DATABASE_URL : undefined,
  host: isProd ? undefined : process.env.DB_HOST,
  port: isProd ? undefined : parseInt(process.env.DB_PORT, 10),
  username: isProd ? undefined : process.env.DB_USERNAME,
  password: isProd ? undefined : process.env.DB_PASSWORD,
  database: isProd ? undefined : process.env.DB_DATABASE,
  schema: 'public',
  // entities: [User, Doctor, Patient, Appointment, DoctorSchedule ,Slot], // 👈 direct imports
  // migrations: ['src/migrations/*.ts'], // in dev, use .ts
  entities: [isProd ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts'],
  migrations: [isProd ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
  synchronize: false,
  logging: ['query', 'error', 'schema'],
  ssl: isProd ? { rejectUnauthorized: false } : false,
});
console.log('DATABASE_URL:', process.env.DATABASE_URL);
