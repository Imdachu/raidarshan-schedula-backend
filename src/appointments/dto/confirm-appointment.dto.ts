import { IsNotEmpty, IsString, IsOptional, ValidateIf, IsDateString } from 'class-validator';

export class ConfirmAppointmentDto {
  @IsOptional()
  @IsString()
  slotId?: string;

  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @ValidateIf(o => !o.slotId)
  @IsNotEmpty({ message: 'For stream bookings, doctorId is required.' })
  doctorIdRequired() {
    return this.doctorId;
  }

  @ValidateIf(o => !o.slotId)
  @IsNotEmpty({ message: 'For stream bookings, date is required.' })
  dateRequired() {
    return this.date;
  }

  @ValidateIf(o => !o.doctorId && !o.date)
  @IsNotEmpty({ message: 'slotId is required for wave bookings.' })
  slotIdRequired() {
    return this.slotId;
  }
}