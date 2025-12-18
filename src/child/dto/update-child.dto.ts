/**
 * Update Child DTO
 */

import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { Gender, BloodType, DeliveryType } from './create-child.dto';

export class UpdateChildDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  chdrNumber?: string;

  @IsOptional()
  @IsString()
  photoUri?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  birthWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  birthHeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  birthHeadCircumference?: number;

  @IsOptional()
  @IsEnum(BloodType)
  bloodType?: BloodType;

  @IsOptional()
  @IsString()
  placeOfBirth?: string;

  @IsOptional()
  @IsEnum(DeliveryType)
  deliveryType?: DeliveryType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialConditions?: string[];

  @IsOptional()
  @IsString()
  motherName?: string;

  @IsOptional()
  @IsString()
  fatherName?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
