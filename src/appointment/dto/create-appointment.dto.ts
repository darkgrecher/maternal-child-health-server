import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

export enum AppointmentType {
  vaccination = 'vaccination',
  growth_check = 'growth_check',
  development_check = 'development_check',
  general_checkup = 'general_checkup',
  specialist = 'specialist',
  emergency = 'emergency',
}

export class CreateAppointmentDto {
  @IsString()
  title: string;

  @IsEnum(AppointmentType)
  type: AppointmentType;

  @IsDateString()
  dateTime: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @IsString()
  location: string;

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
  @IsString()
  notes?: string;
}
