/**
 * Midwife Link Controller
 * 
 * QR code endpoints for midwife linking.
 */

import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MidwifeLinkService } from './midwife-link.service';
import { ClaimMidwifeLinkDto, GenerateMidwifeLinkDto } from './dto';

@Controller('midwife-links')
@UseGuards(JwtAuthGuard)
export class MidwifeLinkController {
  constructor(private readonly midwifeLinkService: MidwifeLinkService) {}

  /**
   * Generate a QR code payload for the current midwife
   */
  @Post('qr')
  async generateQr(@Request() req: any, @Body() dto: GenerateMidwifeLinkDto) {
    if (req.user?.actorType !== 'midwife') {
      throw new ForbiddenException('Midwife access required');
    }

    const data = await this.midwifeLinkService.generate(req.user.sub, dto.profileType);
    return { success: true, data };
  }

  /**
   * Get recent QR link notifications for the current midwife
   */
  @Get('notifications')
  async listNotifications(@Request() req: any) {
    if (req.user?.actorType !== 'midwife') {
      throw new ForbiddenException('Midwife access required');
    }

    const data = await this.midwifeLinkService.listNotifications(req.user.sub);
    return { success: true, data };
  }

  /**
   * Claim a midwife QR code for a profile
   */
  @Post('claim')
  async claim(@Request() req: any, @Body() dto: ClaimMidwifeLinkDto) {
    if (req.user?.actorType !== 'user') {
      throw new ForbiddenException('User access required');
    }

    const data = await this.midwifeLinkService.claim(req.user.sub, dto);
    return { success: true, data };
  }
}
