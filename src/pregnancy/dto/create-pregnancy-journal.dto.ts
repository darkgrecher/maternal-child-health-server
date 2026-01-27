/**
 * Create Pregnancy Journal DTO
 * 
 * Data transfer object for creating pregnancy journal entries.
 */

import {
  IsNotEmpty,
  IsInt,
  IsString,
  IsOptional,
  Min,
  Max,
  IsDateString,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePregnancyJournalDto {
  @ApiPropertyOptional({ description: 'Date of the journal entry', example: '2026-01-27' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ description: 'Week of pregnancy', example: 20, minimum: 1, maximum: 42 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(42)
  weekOfPregnancy: number;

  @ApiProperty({ description: 'Title of the journal entry', example: 'First Kick!' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Content of the journal entry' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ 
    description: 'Mood at the time of entry',
    example: 'happy',
    enum: ['happy', 'excited', 'neutral', 'tired', 'anxious']
  })
  @IsOptional()
  @IsString()
  @IsIn(['happy', 'excited', 'neutral', 'tired', 'anxious'])
  mood?: string;
}
