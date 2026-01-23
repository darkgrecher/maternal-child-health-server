/**
 * Convert Pregnancy to Child DTO
 * 
 * This DTO is used when a pregnancy is completed (baby is born)
 * and the mother wants to convert the pregnancy profile to a child profile.
 */

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  IsArray,
  Min,
  Max,
} from 'class-validator';

// Note: Using local enum definitions to avoid circular dependencies
// DeliveryType is also defined in update-pregnancy.dto.ts

enum Gender {
  male = 'male',
  female = 'female',
}

enum ConvertDeliveryType {
  normal = 'normal',
  cesarean = 'cesarean',
  assisted = 'assisted',
}

export class ConvertToChildDto {
  // Baby's Information (required at birth)
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsDateString()
  dateOfBirth: string; // Actual delivery date

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsString()
  chdrNumber?: string;

  @IsOptional()
  @IsString()
  photoUri?: string;

  // Birth Measurements
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  birthWeight?: number; // in kg

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  birthHeight?: number; // in cm

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  birthHeadCircumference?: number; // in cm

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsString()
  placeOfBirth?: string;

  @IsOptional()
  @IsEnum(ConvertDeliveryType)
  deliveryType?: 'normal' | 'cesarean' | 'assisted';

  // Delivery Information
  @IsOptional()
  @IsString()
  deliveryNotes?: string;

  // Medical Information (to transfer from pregnancy)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialConditions?: string[];

  // Address (can be updated)
  @IsOptional()
  @IsString()
  address?: string;
}
