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

export class CreatePregnancyJournalDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(42)
  weekOfPregnancy: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  @IsIn(['happy', 'excited', 'neutral', 'tired', 'anxious'])
  mood?: string;
}
