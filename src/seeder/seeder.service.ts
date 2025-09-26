import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor, ScheduleType } from '../doctors/doctor.entity';
import { Patient } from '../patients/patient.entity';
import { User, UserRole, AuthProvider } from '../users/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed() {

    const adminEmail = 'admin@schedula.com';
    let adminUser = await this.userRepository.findOne({ where: { email: adminEmail } });

    if (!adminUser) {
      console.log('Admin user not found, creating one...');
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('AdminPassword123', salt);

      adminUser = this.userRepository.create({
        name: 'Admin User',
        email: 'admin@schedula.com',
        password_hash: hashedPassword,
        role: UserRole.ADMIN,
        provider: AuthProvider.EMAIL,
        is_verified: true,
    });
      await this.userRepository.save(adminUser);
    }else {
        console.log('Admin user already exists.');
    }
    
    const doctorCount = await this.doctorRepository.count();
    if (doctorCount === 0) {
      console.log('Seeding doctors...');
      const doctors = [
        { name: 'Dr. Sharma', specialization: 'Cardiology', location: 'Bangalore', schedule_type: ScheduleType.WAVE },
        { name: 'Dr. Nair', specialization: 'Dermatology', location: 'Bangalore', schedule_type: ScheduleType.STREAM },
        { name: 'Dr. Rao', specialization: 'Neurology', location: 'Mumbai', schedule_type: ScheduleType.WAVE },
      ];
      await this.doctorRepository.save(doctors);
  }

    const patientEmail = 'darshan.rai@example.com';
    let patientUser = await this.userRepository.findOne({ where: { email: patientEmail } });
    if (!patientUser) {
      console.log('Patient user not found, creating one...');
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('PatientPassword123', salt);

      // Create the User record for the patient
      patientUser = this.userRepository.create({
        name: 'Darshan Rai',
        email: patientEmail,
        password_hash: hashedPassword,
        role: UserRole.PATIENT,
        provider: AuthProvider.EMAIL,
        is_verified: true,
         });
      await this.userRepository.save(patientUser);


      const newPatient = this.patientRepository.create({
        name: 'Darshan Rai',
        user: patientUser,
      });
      await this.patientRepository.save(newPatient);
    }else {
        console.log('Patient user already exists.');
    }

    console.log('Seeding complete!');
  }
}