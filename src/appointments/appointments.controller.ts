import { Body, Controller, Post, Request, UseGuards, ValidationPipe, Get, Param, NotFoundException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { ConfirmAppointmentDto } from './dto/confirm-appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Appointment } from './appointment.entity';

@Controller('api/v1/appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req,
    @Body(ValidationPipe) confirmAppointmentDto: ConfirmAppointmentDto,
  ): Promise<Appointment> {
    // We assume the patient's ID is in the JWT payload
    // You may need to adjust this based on your User/Patient entity relationship
    const userId = req.user.userId; 
    console.log(userId);

    return this.appointmentsService.create(userId, confirmAppointmentDto);
  }
  @Get(':id')
  async getAppointment(@Param('id') id: string) {
    const appointment = await this.appointmentsService.findOneById(id);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    return appointment;
  }
}