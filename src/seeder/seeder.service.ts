import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor, ScheduleType } from '../doctors/doctor.entity';
import { Patient } from '../patients/patient.entity';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async seed() {
    // Clear existing data
    await this.doctorRepository.clear();
    await this.patientRepository.clear();

    // Seed Doctors
    const doctors = [
      { name: 'Dr. Sharma', specialization: 'Cardiology', location: 'Bangalore', schedule_type: ScheduleType.WAVE },
      { name: 'Dr. Nair', specialization: 'Dermatology', location: 'Bangalore', schedule_type: ScheduleType.STREAM },
    ];
    await this.doctorRepository.save(doctors);

    // Seed Patients
    const patients = [
      { name: 'Darshan Rai' },
    ];
    await this.patientRepository.save(patients);

    console.log('Seeding complete!');
  }
}