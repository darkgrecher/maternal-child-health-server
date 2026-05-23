import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMidwifeRegionDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  region?: string | null;
}
