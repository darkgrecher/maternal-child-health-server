import { Controller, ForbiddenException, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { AdminAlertsService } from './admin-alerts.service';

interface AdminAlertsQuery {
  range?: string;
  limit?: string;
}

@Controller('admin/alerts')
@UseGuards(JwtAuthGuard)
export class AdminAlertsController {
  constructor(private readonly adminAlertsService: AdminAlertsService) {}

  private assertAdminAccess(req: any) {
    if (req.user?.actorType !== 'midwife' || req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Get()
  async getAlerts(@Request() req: any, @Query() query: AdminAlertsQuery) {
    this.assertAdminAccess(req);
    const data = await this.adminAlertsService.getAlerts(query);
    return { success: true, data };
  }
}
