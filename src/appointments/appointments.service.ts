import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Appointment } from './appointment.entity';
import { ConfirmAppointmentDto } from './dto/confirm-appointment.dto';
import { Doctor } from '../doctors/doctor.entity';
import { Patient } from '../patients/patient.entity';
import { DoctorSchedule } from '../schedules/schedule.entity';
import { Equal } from 'typeorm';


@Injectable()
export class AppointmentsService {
  // The Repositories are declared here, but injected in the constructor
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(DoctorSchedule) // You need to inject this repository as well
    private readonly scheduleRepository: Repository<DoctorSchedule>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    userId: string,
    confirmAppointmentDto: ConfirmAppointmentDto,
  ): Promise<Appointment> {

    const { slotId } = confirmAppointmentDto;
    // slotId: <doctorId>-<dateYYYYMMDD>-<startTimeHHMM>
    // UUID is always 36 chars
    const uuidLength = 36;
    const doctorId = slotId.substring(0, uuidLength);
    const dateString = slotId.substring(uuidLength + 1, uuidLength + 1 + 8);
    const timeString = slotId.substring(uuidLength + 1 + 8 + 1);
    if (!doctorId || !dateString || !timeString) {
      throw new Error('Invalid slotId format');
    }
    const date = `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-${dateString.substring(6, 8)}`;
    const assigned_time = `${timeString.substring(0, 2)}:${timeString.substring(2, 4)}`;


    // Find patient profile linked to the logged-in user
    const patient = await this.patientRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!patient) {
      throw new NotFoundException(
        'Patient profile not found for the logged-in user',
      );
    }
    
    // Use a transaction to ensure data consistency
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const doctor = await transactionalEntityManager.findOne(Doctor, {
        where: { id: doctorId },
      });
      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }

      const schedule = await transactionalEntityManager.findOne(DoctorSchedule, {
        where: { doctor: { id: doctorId }, date },
      });

      if (!schedule || !schedule.capacity_per_slot) {
        throw new NotFoundException(
          'Schedule not found for this doctor on this date',
        );
      }

      const bookedCount = await transactionalEntityManager.count(Appointment, {
        where: { doctor: { id: doctorId }, assigned_time },
      });

      if (bookedCount >= schedule.capacity_per_slot) {
        throw new ConflictException('This time slot is already full');
      }

      const newAppointment = transactionalEntityManager.create(Appointment, {
        doctor,
        patient,
        assigned_time,
      });

      const savedAppointment = await transactionalEntityManager.save(newAppointment);
      // Add assigned_date to the response
      return {
        ...savedAppointment,
        assigned_date: date,
      };
    });
  }
}