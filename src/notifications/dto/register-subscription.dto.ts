import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class RegisterWebPushSubscriptionDto {
  @IsString()
  endpoint: string;

  @IsString()
  p256dh: string;

  @IsString()
  auth: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
