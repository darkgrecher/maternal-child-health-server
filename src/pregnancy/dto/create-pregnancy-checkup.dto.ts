/**
 * Create Pregnancy Checkup DTO
 */

import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsArray,
  Min,
  Max,
} from 'class-validator';

export class CreatePregnancyCheckupDto {
  @IsDateString()
  checkupDate: string;

  @IsNumber()
  @Min(1)
  @Max(42)
  weekOfPregnancy: number;

  // Measurements
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  bloodPressureSystolic?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  bloodPressureDiastolic?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fundalHeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  fetalHeartRate?: number;

  // Baby's measurements
  @IsOptional()
  @IsNumber()
  @Min(0)
  fetalWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fetalLength?: number;

  @IsOptional()
  @IsString()
  amnioticFluid?: string;

  @IsOptional()
  @IsString()
  placentaPosition?: string;

  // Test results
  @IsOptional()
  @IsString()
  urineProtein?: string;

  @IsOptional()
  @IsString()
  urineGlucose?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hemoglobin?: number;

  // Notes
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recommendations?: string[];

  @IsOptional()
  @IsDateString()
  nextCheckupDate?: string;

  @IsOptional()
  @IsString()
  providerName?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
