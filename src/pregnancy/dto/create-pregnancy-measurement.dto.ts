/**
 * Create Pregnancy Measurement DTO
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

export class CreatePregnancyMeasurementDto {
  @IsDateString()
  measurementDate: string;

  @IsNumber()
  @Min(1)
  @Max(42)
  weekOfPregnancy: number;

  @IsNumber()
  @Min(0)
  weight: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bellyCircumference?: number;

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
  @IsArray()
  @IsString({ each: true })
  symptoms?: string[];

  @IsOptional()
  @IsString()
  mood?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
