import { Injectable, NotFoundException, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { ConfirmAppointmentDto } from './dto/confirm-appointment.dto';
import { AppointmentListStatus } from './dto/get-appointments.dto';
import { Doctor } from '../doctors/doctor.entity';
import { Patient } from '../patients/patient.entity';
import { DoctorSchedule, WaveMode } from '../schedules/schedule.entity';
import { Equal } from 'typeorm';


@Injectable()
export class AppointmentsService {

  async findAllForPatient(userId: string, status?: AppointmentListStatus) {
    // 1. Find the patient profile for this user
    const patient = await this.patientRepository.findOne({ where: { user: { id: userId } } });
    if (!patient) {
      throw new NotFoundException('Patient profile not found for the logged-in user');
    }

    // 2. Build base query for this patient
    const qb = this.appointmentRepository.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .where('appointment.patient = :patientId', { patientId: patient.id });

    // Use assigned_date and assigned_time for filtering
    // We assume assigned_date is returned from the DB as a string (YYYY-MM-DD)
    // and assigned_time as string (HH:mm)
    const now = new Date();
    const nowDate = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const nowTime = now.toTimeString().slice(0, 5); // HH:mm

    if (status === AppointmentListStatus.UPCOMING) {
      // Upcoming: CONFIRMED and scheduled for the future
      qb.andWhere('appointment.status = :confirmed', { confirmed: AppointmentStatus.CONFIRMED })
        .andWhere(
          '(appointment.assigned_date > :nowDate OR (appointment.assigned_date = :nowDate AND appointment.assigned_time > :nowTime))',
          { nowDate, nowTime }
        );
    } else if (status === AppointmentListStatus.PAST) {
      // Past: COMPLETED, or CONFIRMED but scheduled in the past
      qb.andWhere(
        '(appointment.status = :completed OR (appointment.status = :confirmed AND (appointment.assigned_date < :nowDate OR (appointment.assigned_date = :nowDate AND appointment.assigned_time <= :nowTime))))',
        { completed: AppointmentStatus.COMPLETED, confirmed: AppointmentStatus.CONFIRMED, nowDate, nowTime }
      );
    } else if (status === AppointmentListStatus.CANCELLED) {
      qb.andWhere('appointment.status = :cancelled', { cancelled: AppointmentStatus.CANCELLED });
    }

    return qb.orderBy('appointment.assigned_date', 'DESC').addOrderBy('appointment.assigned_time', 'DESC').getMany();
  }
  async cancelByPatient(appointmentId: string, userId: string) {
    // 1. Find the patient profile for this user
    const patient = await this.patientRepository.findOne({ where: { user: { id: userId } } });
    if (!patient) {
      throw new NotFoundException('Patient profile not found for the logged-in user');
    }

    // 2. Find the appointment and load patient relation
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['patient'],
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // 3. Security: Only the owner patient can cancel
    if (!appointment.patient || appointment.patient.id !== patient.id) {
      throw new UnauthorizedException('You are not authorized to cancel this appointment');
    }

    // 4. Business logic: Only CONFIRMED can be cancelled
    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed appointments can be cancelled');
    }

    // 5. Update status and save
    appointment.status = AppointmentStatus.CANCELLED;
    await this.appointmentRepository.save(appointment);
    return appointment;
  }
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
      throw new NotFoundException('Patient profile not found for the logged-in user');
    }
    // Use a transaction to ensure data consistency
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const doctor = await transactionalEntityManager.findOne(Doctor, {
        where: { id: doctorId },
      });
      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }

      // Try to find a schedule for this doctor and date
      let schedule = await transactionalEntityManager.findOne(DoctorSchedule, {
        where: { doctor: { id: doctorId }, date },
      });
      // If not found, try to find a recurring schedule for the weekday
      if (!schedule) {
        const weekday = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        schedule = await transactionalEntityManager.createQueryBuilder(DoctorSchedule, 'schedule')
          .leftJoin('schedule.doctor', 'doctor')
          .where('doctor.id = :doctorId', { doctorId })
          .andWhere(':weekday = ANY(schedule.weekdays)', { weekday })
          .getOne();
      }

      // Branch: If schedule is manual (wave_mode === WaveMode.DOCTOR), use Slot entity for capacity
      if (schedule && schedule.wave_mode === WaveMode.DOCTOR) {
        // Find the slot by slot_id_composite using Slot entity
        const slotRepo = transactionalEntityManager.getRepository('Slot');
        const slot = await slotRepo.findOne({ where: { slot_id_composite: slotId } });
        if (!slot) {
          throw new NotFoundException('Manual slot not found for this slotId');
        }
        if (slot.booked_count >= slot.capacity) {
          throw new ConflictException('This manual slot is already full');
        }
        // Book the appointment
        const newAppointment = transactionalEntityManager.create(Appointment, {
          doctor,
          patient,
          assigned_time,
          assigned_date: date,
        });
        // Increment booked_count for the slot
        slot.booked_count += 1;
        await slotRepo.save(slot);
        const savedAppointment = await transactionalEntityManager.save(newAppointment);
        return {
          ...savedAppointment,
          assigned_date: date,
        };
      }

      // SYSTEM slot logic (as before)
      if (!schedule || !schedule.capacity_per_slot) {
        throw new NotFoundException('Schedule not found for this doctor on this date');
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
        assigned_date: date,
      });
      const savedAppointment = await transactionalEntityManager.save(newAppointment);
      return {
        ...savedAppointment,
        assigned_date: date,
      };
    });
  }
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

  async findOneById(id: string) {
    // Find appointment with doctor and patient relations
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['doctor', 'patient'],
    });
    if (!appointment) return null;

    // Build slot_id if possible
    let slot_id = undefined;
    if (appointment.doctor?.id && appointment.assigned_time) {
      // Use created_at as the date if available, else fallback to today
      const dateObj = appointment.created_at ? new Date(appointment.created_at) : new Date();
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(dateObj.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}${mm}${dd}`;
      const timeStr = appointment.assigned_time.replace(':', '');
      slot_id = `${appointment.doctor.id}-${dateStr}-${timeStr}`;
    }

    return {
      id: appointment.id,
      status: appointment.status,
      assigned_date: appointment.created_at ? appointment.created_at.toISOString().slice(0, 10) : undefined,
      assigned_time: appointment.assigned_time,
      slot_id,
      doctor: appointment.doctor
        ? {
            id: appointment.doctor.id,
            name: appointment.doctor.name,
            specialization: appointment.doctor.specialization,
            location: appointment.doctor.location,
            schedule_type: appointment.doctor.schedule_type,
          }
        : undefined,
      patient: appointment.patient
        ? {
            id: appointment.patient.id,
            name: appointment.patient.name,
            contact: appointment.patient.contact,
          }
        : undefined,
      created_at: appointment.created_at,
      updated_at: appointment.updated_at,
    };
  }
}