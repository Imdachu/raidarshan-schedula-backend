import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { WaveMode } from '../schedule.entity';

export class CreateScheduleDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  consultingStart: string; // e.g., "09:00:00"

  @IsString()
  @IsNotEmpty()
  consultingEnd: string; // e.g., "17:00:00"

  @IsEnum(WaveMode)
  @IsNotEmpty()
  waveMode: WaveMode;

  @IsInt()
  @Min(1)
  slotDuration: number; // in minutes

  @IsInt()
  @Min(1)
  capacityPerSlot: number;
}