/**
 * Midwife Update DTO
 *
 * Data transfer object for admin-only midwife updates.
 */

import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { MidwifeRole } from '@prisma/client';

export class MidwifeUpdateDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  givenName?: string;

  @IsOptional()
  @IsString()
  familyName?: string;

  @IsOptional()
  @IsString()
  picture?: string;

  @IsOptional()
  @IsEnum(MidwifeRole, { message: 'Role must be midwife, admin, or supervisor' })
  role?: MidwifeRole;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  facilityName?: string;

  @IsOptional()
  @IsString()
  region?: string;
}
