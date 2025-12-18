import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class CreateGrowthMeasurementDto {
  @IsDateString()
  measurementDate: string;

  @IsNumber()
  @Min(0)
  weight: number; // in kg

  @IsNumber()
  @Min(0)
  height: number; // in cm

  @IsNumber()
  @IsOptional()
  @Min(0)
  headCircumference?: number; // in cm

  @IsString()
  @IsOptional()
  measuredBy?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
