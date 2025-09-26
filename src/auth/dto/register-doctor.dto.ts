import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';
import { ScheduleType } from '../../doctors/doctor.entity';

export class RegisterDoctorDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  specialization: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsEnum(ScheduleType)
  schedule_type: ScheduleType;
}
