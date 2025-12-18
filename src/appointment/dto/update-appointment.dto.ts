import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
} from 'class-validator';
import { AppointmentType } from './create-appointment.dto';

export enum AppointmentStatus {
  scheduled = 'scheduled',
  completed = 'completed',
  cancelled = 'cancelled',
  rescheduled = 'rescheduled',
  missed = 'missed',
}

export class UpdateAppointmentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @IsOptional()
  @IsDateString()
  dateTime?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  providerName?: string;

  @IsOptional()
  @IsString()
  providerRole?: string;

  @IsOptional()
  @IsString()
  providerPhone?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  reminderSent?: boolean;
}
