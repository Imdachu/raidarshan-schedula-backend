import { IsDateString, IsNotEmpty } from 'class-validator';

export class GetSlotsDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;
}