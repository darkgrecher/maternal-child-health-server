/**
 * Create Vaccination Record DTO
 */

import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsEnum,
} from 'class-validator';

export enum VaccinationStatusDto {
  pending = 'pending',
  completed = 'completed',
  overdue = 'overdue',
  missed = 'missed',
  scheduled = 'scheduled',
}

export class CreateVaccinationRecordDto {
  @IsString()
  childId: string;

  @IsString()
  vaccineId: string;

  @IsDateString()
  scheduledDate: string;

  @IsOptional()
  @IsEnum(VaccinationStatusDto)
  status?: VaccinationStatusDto;

  @IsOptional()
  @IsDateString()
  administeredDate?: string;

  @IsOptional()
  @IsString()
  administeredBy?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  batchNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sideEffectsOccurred?: string[];
}
