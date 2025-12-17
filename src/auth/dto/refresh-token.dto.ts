/**
 * Refresh Token DTO
 * 
 * Data transfer object for token refresh request.
 */

import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
