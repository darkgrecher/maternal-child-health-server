import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class RegisterDeviceTokenDto {
  @IsString()
  deviceId: string;

  @IsString()
  token: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  lastUsedAt?: string;
}
