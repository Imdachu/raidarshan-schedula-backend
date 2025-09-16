import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { Doctor } from './doctor.entity';
import { QueryDoctorsDto } from './dto/query-doctors.dto';

@Controller('api/v1/doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    queryDoctorsDto: QueryDoctorsDto,
  ): Promise<Doctor[]> {
    return this.doctorsService.findAll(queryDoctorsDto);
  }
}