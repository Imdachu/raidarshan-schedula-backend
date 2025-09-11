import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './src/users/user.entity';
import { Doctor } from './src/doctors/doctor.entity';
import { Patient } from './src/patients/patient.entity';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  schema: 'public',
  entities: [User, Doctor, Patient], // 👈 direct imports
  migrations: ['src/migrations/*.ts'], // in dev, use .ts
});
