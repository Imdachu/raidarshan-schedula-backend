import { IsOptional, IsString } from 'class-validator';

export class QueryDoctorsDto {
  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  name?: string;
}