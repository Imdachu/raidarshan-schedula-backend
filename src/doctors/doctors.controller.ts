import { Controller, Get , Param, Query, ValidationPipe } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { Doctor } from './doctor.entity';
import { QueryDoctorsDto } from './dto/query-doctors.dto';
import { SchedulesService } from '../schedules/schedules.service'; // <-- 1. Import SchedulesService
import { GetSlotsDto } from '../schedules/dto/get-slots.dto'; // <-- 2. Import DTO

@Controller('api/v1/doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService,
  private readonly schedulesService: SchedulesService, // <-- 3. Inject SchedulesService
  ) {}

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    queryDoctorsDto: QueryDoctorsDto,
  ): Promise<Doctor[]> {
    return this.doctorsService.findAll(queryDoctorsDto);
  }
  @Get(':id/available-slots')
  async findAvailableSlots(
    @Param('id') doctorId: string,
    @Query(new ValidationPipe({ transform: true })) getSlotsDto: GetSlotsDto,
  ) {
  return this.schedulesService.findAvailableSlots(doctorId, getSlotsDto.date);
  }
}