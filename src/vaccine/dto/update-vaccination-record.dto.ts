/**
 * Update Vaccination Record DTO
 */

import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsEnum,
} from 'class-validator';
import { VaccinationStatusDto } from './create-vaccination-record.dto';

export class UpdateVaccinationRecordDto {
  @IsOptional()
  @IsEnum(VaccinationStatusDto)
  status?: VaccinationStatusDto;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

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
