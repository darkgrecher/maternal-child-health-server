import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { SettingsPayload, SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  private getMidwifeId(req: any): string {
    if (req.user?.actorType !== 'midwife') {
      throw new ForbiddenException('Midwife access required');
    }
    return req.user.sub;
  }

  @Get()
  async getSettings(@Request() req: any): Promise<{ success: boolean; data: SettingsPayload }> {
    const data = await this.settingsService.getSettings(this.getMidwifeId(req));
    return { success: true, data };
  }

  @Put()
  async updateSettings(
    @Request() req: any,
    @Body() dto: UpdateSettingsDto
  ): Promise<{ success: boolean; data: SettingsPayload }> {
    const data = await this.settingsService.updateSettings(this.getMidwifeId(req), dto);
    return { success: true, data };
  }
}
