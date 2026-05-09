/**
 * Generate Midwife Link DTO
 */

import { IsIn } from 'class-validator';

export class GenerateMidwifeLinkDto {
  @IsIn(['child', 'pregnancy'])
  profileType: 'child' | 'pregnancy';
}
