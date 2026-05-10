/**
 * Generate Midwife Link DTO
 */

import { IsIn, IsOptional } from 'class-validator';

export class GenerateMidwifeLinkDto {
  @IsOptional()
  @IsIn(['child', 'pregnancy'])
  profileType?: 'child' | 'pregnancy';
}
