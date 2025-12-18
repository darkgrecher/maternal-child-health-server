import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateGrowthMeasurementDto {
  @IsDateString()
  @IsOptional()
  measurementDate?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  height?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  headCircumference?: number;

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
