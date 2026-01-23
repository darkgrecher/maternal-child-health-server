import { IsString, IsBoolean, IsOptional, IsEmail } from 'class-validator';

export class CreateEmergencyContactDto {
  @IsString()
  name: string;

  @IsString()
  role: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
