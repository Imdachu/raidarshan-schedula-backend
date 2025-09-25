import { IsArray, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateIf } from 'class-validator';
import { WaveMode, Weekday } from '../schedule.entity';
import { ScheduleType } from '../../doctors/doctor.entity';
import { Transform } from 'class-transformer';

export class CreateScheduleDto {
  @IsDateString()
  @IsNotEmpty()
  @ValidateIf(o => !o.weekdays)
  date: string;

  @IsEnum(ScheduleType)
  @IsNotEmpty()
  scheduleType: ScheduleType; // 'wave' or 'stream'



  @IsArray()
  @IsEnum(Weekday, { each: true }) // This validates every item in the array against the Weekday enum
  @IsNotEmpty()
  @ValidateIf(o => !o.date)
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map(v => v.toLowerCase()) : value
  )

  weekdays?: Weekday[];

  @IsString()
  @IsNotEmpty()
  consultingStart: string; // e.g., "09:00:00"

  @IsString()
  @IsNotEmpty()
  consultingEnd: string; // e.g., "17:00:00"

  @ValidateIf(o => o.scheduleType === ScheduleType.WAVE)
  @IsEnum(WaveMode)
  @IsNotEmpty()
  waveMode?: WaveMode;

  @ValidateIf(o => o.scheduleType === ScheduleType.WAVE)
  @IsInt()
  @Min(1)
  slotDuration: number; // in minutes

  @ValidateIf(o => o.scheduleType === ScheduleType.WAVE)
  @IsInt()
  @Min(1)
  capacityPerSlot: number;

  @ValidateIf(o => o.scheduleType === ScheduleType.STREAM)
  @IsInt()
  @Min(1)
  totalCapacity?: number;
}