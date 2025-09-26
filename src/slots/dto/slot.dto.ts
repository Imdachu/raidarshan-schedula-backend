import { IsString, IsInt, Min, IsNotEmpty } from 'class-validator';

export class SlotDto {
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsInt()
  @Min(1)
  capacity: number;
}
