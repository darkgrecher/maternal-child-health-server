import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpdateSettingsProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  picture?: string;
}

export class UpdateSettingsNotificationsDto {
  @IsOptional()
  @IsBoolean()
  appointments?: boolean;

  @IsOptional()
  @IsBoolean()
  vaccinations?: boolean;

  @IsOptional()
  @IsBoolean()
  highRisk?: boolean;

  @IsOptional()
  @IsBoolean()
  dailyDigest?: boolean;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;
}

export class UpdateSettingsPreferencesDto {
  @IsOptional()
  @IsIn(['light', 'dark', 'system'])
  theme?: 'light' | 'dark' | 'system';

  @IsOptional()
  @IsIn(['en', 'si', 'ta'])
  language?: string;

  @IsOptional()
  @IsIn(['mdy', 'dmy', 'ymd'])
  dateFormat?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSettingsNotificationsDto)
  notifications?: UpdateSettingsNotificationsDto;
}

export class UpdateSettingsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSettingsProfileDto)
  profile?: UpdateSettingsProfileDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSettingsPreferencesDto)
  preferences?: UpdateSettingsPreferencesDto;
}
