/**
 * Create Pregnancy DTO
 */

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
  Max,
} from 'class-validator';

export enum PregnancyStatus {
  active = 'active',
  delivered = 'delivered',
  terminated = 'terminated',
  converted = 'converted',
}

export class CreatePregnancyDto {
  // Mother's Information
  @IsString()
  @IsNotEmpty()
  motherFirstName: string;

  @IsString()
  @IsNotEmpty()
  motherLastName: string;

  @IsDateString()
  motherDateOfBirth: string;

  @IsOptional()
  @IsString()
  motherBloodType?: string;

  @IsOptional()
  @IsString()
  motherPhotoUri?: string;

  // Pregnancy Information
  @IsDateString()
  expectedDeliveryDate: string;

  @IsOptional()
  @IsDateString()
  lastMenstrualPeriod?: string;

  @IsOptional()
  @IsDateString()
  conceptionDate?: string;

  // Medical Information
  @IsOptional()
  @IsNumber()
  @Min(0)
  gravida?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  para?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  prePregnancyWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  // Risk Factors
  @IsOptional()
  @IsBoolean()
  isHighRisk?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  riskFactors?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicalConditions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];

  // Healthcare
  @IsOptional()
  @IsString()
  hospitalName?: string;

  @IsOptional()
  @IsString()
  obgynName?: string;

  @IsOptional()
  @IsString()
  obgynContact?: string;

  @IsOptional()
  @IsString()
  midwifeName?: string;

  @IsOptional()
  @IsString()
  midwifeContact?: string;

  // Baby Information
  @IsOptional()
  @IsEnum(['male', 'female'])
  expectedGender?: 'male' | 'female';

  @IsOptional()
  @IsString()
  babyNickname?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(8)
  numberOfBabies?: number;

  // Emergency Contact
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString()
  emergencyContactRelation?: string;
}
