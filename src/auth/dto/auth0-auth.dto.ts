/**
 * Auth0 Auth DTO
 * 
 * Data Transfer Object for Auth0 authentication.
 */

import { IsNotEmpty, IsString } from 'class-validator';

export class Auth0AuthDto {
  @IsString()
  @IsNotEmpty({ message: 'Auth0 token is required' })
  auth0Token: string;
}
