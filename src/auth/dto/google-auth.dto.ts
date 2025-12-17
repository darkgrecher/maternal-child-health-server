/**
 * Google Auth DTO
 * 
 * Data transfer object for Google authentication request.
 * Supports both ID token and authorization code flows.
 */

import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class GoogleAuthDto {
  @IsOptional()
  @IsString()
  idToken?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  redirectUri?: string;

  // At least one of idToken or code must be provided
  @ValidateIf(o => !o.idToken && !o.code)
  @IsString()
  requireTokenOrCode?: string;
}
