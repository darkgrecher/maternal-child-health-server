import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';

export enum ActivityType {
  VACCINATION = 'vaccination',
  GROWTH = 'growth',
  MILESTONE = 'milestone',
  APPOINTMENT = 'appointment',
  CHECKUP = 'checkup',
}

export class CreateActivityDto {
  @IsEnum(ActivityType)
  type: ActivityType;

  @IsString()
  title: string;

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
