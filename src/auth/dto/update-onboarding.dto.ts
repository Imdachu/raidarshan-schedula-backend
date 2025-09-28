import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateOnboardingDto {
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  step: number;
}