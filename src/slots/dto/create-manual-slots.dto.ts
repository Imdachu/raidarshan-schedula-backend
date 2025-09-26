import { IsDateString, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { SlotDto } from './slot.dto';

export class CreateManualSlotsDto {
  @IsDateString()
  date: string;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SlotDto)
  slots: SlotDto[];
}
