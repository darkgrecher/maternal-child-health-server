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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePregnancySymptomDto {
  @ApiPropertyOptional({ description: 'Date of the symptom record', example: '2026-01-27' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ description: 'Week of pregnancy', example: 20, minimum: 1, maximum: 42 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(42)
  weekOfPregnancy: number;

  @ApiProperty({ 
    description: 'Array of symptom IDs', 
    example: ['fatigue', 'nausea', 'backpain'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  symptoms: string[];

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
