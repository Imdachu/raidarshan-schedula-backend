import { Body, Controller, Param, Post, ValidationPipe, Get, Query } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { DoctorSchedule } from './schedule.entity';
import { GetSlotsDto } from './dto/get-slots.dto';

@Controller('api/v1/doctors/:id/schedule')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  async create(
    @Param('id') doctorId: string,
    @Body(ValidationPipe) createScheduleDto: CreateScheduleDto,
  ): Promise<DoctorSchedule> {
    return this.schedulesService.create(doctorId, createScheduleDto);
  }

  @Get('/../available-slots')
  async getAvailableSlots(
    @Param('id') doctorId: string,
    @Query(ValidationPipe) query: GetSlotsDto,
  ) {
    return this.schedulesService.findAvailableSlots(doctorId, query.date);
  }
}