/**
 * Midwife Login DTO
 *
 * Data transfer object for midwife email/password login.
 */

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class MidwifeLoginDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}
