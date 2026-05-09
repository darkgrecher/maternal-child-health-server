/**
 * Claim Midwife Link DTO
 * 
 * Data transfer object for linking a profile to a midwife via QR.
 */

import { IsIn, IsString, IsUUID, MinLength } from 'class-validator';

export class ClaimMidwifeLinkDto {
  @IsString()
  @MinLength(6)
  code: string;

  @IsIn(['child', 'pregnancy'])
  profileType: 'child' | 'pregnancy';

  @IsUUID()
  profileId: string;
}
