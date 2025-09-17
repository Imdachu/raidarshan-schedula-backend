import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmAppointmentDto {
  @IsString()
  @IsNotEmpty()
  slotId: string;
}