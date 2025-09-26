import { IsOptional, IsEnum } from 'class-validator';

export enum AppointmentListStatus {
  UPCOMING = 'upcoming',
  PAST = 'past',
  CANCELLED = 'cancelled',
}

export class GetAppointmentsDto {
  @IsOptional()
  @IsEnum(AppointmentListStatus, {
    message: 'status must be one of: upcoming, past, cancelled',
  })
  status?: AppointmentListStatus;
}
