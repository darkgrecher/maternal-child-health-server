import { Controller, Get, Query, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { AdminAnalyticsService } from './admin-analytics.service';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard)
export class AdminAnalyticsController {
  constructor(private readonly adminAnalyticsService: AdminAnalyticsService) {}

  private assertAdminAccess(req: any) {
    if (req.user?.actorType !== 'midwife' || req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Get()
  async getAnalytics(@Request() req, @Query('range') range?: string) {
    this.assertAdminAccess(req);
    const data = await this.adminAnalyticsService.getAnalytics(range);
    return { success: true, data };
  }
}
