import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  private getActor(req: any): { id: string; actorType: 'user' | 'midwife' } {
    return { id: req.user.sub, actorType: req.user.actorType || 'user' };
  }

  @Get()
  async getDashboard(@Request() req) {
    const data = await this.dashboardService.getDashboard(this.getActor(req));
    return { success: true, data };
  }
}
