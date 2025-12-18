/**
 * Create Child DTO
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

export enum Gender {
  male = 'male',
  female = 'female',
}

export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
  unknown = 'unknown',
}

export enum DeliveryType {
  normal = 'normal',
  cesarean = 'cesarean',
  assisted = 'assisted',
}

export class CreateChildDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsDateString()
  dateOfBirth: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsString()
  chdrNumber?: string;

  @IsOptional()
  @IsString()
  photoUri?: string;

  // Birth Information
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

  // Medical Information
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialConditions?: string[];

  // Family Information
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
