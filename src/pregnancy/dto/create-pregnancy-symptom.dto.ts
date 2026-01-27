/**
 * Create Pregnancy Symptom DTO
 * 
 * Data transfer object for creating pregnancy symptom records.
 */

import {
  IsNotEmpty,
  IsInt,
  IsArray,
  IsString,
  IsOptional,
  Min,
  Max,
  IsDateString,
} from 'class-validator';

export class CreatePregnancySymptomDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(42)
  weekOfPregnancy: number;

  @IsArray()
  @IsString({ each: true })
  symptoms: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
