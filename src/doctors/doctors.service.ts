import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { Doctor } from './doctor.entity';
import { QueryDoctorsDto } from './dto/query-doctors.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async findAll(queryDoctorsDto: QueryDoctorsDto): Promise<Doctor[]> {
    const { specialization, location, name } = queryDoctorsDto;

    const where: any = {};

    if (specialization) {
      where.specialization = specialization;
    }
    if (location) {
      where.location = location;
    }
    if (name) {
      where.name = Like(`%${name}%`); // Allows for partial matching
    }

    return this.doctorRepository.find({ where });
  }
}