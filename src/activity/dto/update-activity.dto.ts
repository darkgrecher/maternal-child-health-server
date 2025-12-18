import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ActivityType } from './create-activity.dto';

export class UpdateActivityDto {
  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  icon?: string;
}
