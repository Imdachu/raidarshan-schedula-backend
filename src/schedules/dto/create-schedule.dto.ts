import {IsArray,  IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional,IsString, Min , ValidateIf} from 'class-validator';
import { WaveMode , Weekday} from '../schedule.entity';

export class CreateScheduleDto {
  @IsDateString()
  @IsNotEmpty()
  @ValidateIf(o => !o.weekdays)
  date: string;


  @IsArray()
  @IsEnum(Weekday, { each: true }) // This validates every item in the array against the Weekday enum
  @IsNotEmpty()
  @ValidateIf(o => !o.date)
  weekdays?: Weekday[];

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