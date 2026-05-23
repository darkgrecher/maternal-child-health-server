import { Controller, ForbiddenException, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { AdminNotificationsService } from './admin-notifications.service';

interface AdminNotificationsQuery {
  range?: string;
  limit?: string;
}

@Controller('admin/notifications')
@UseGuards(JwtAuthGuard)
export class AdminNotificationsController {
  constructor(private readonly adminNotificationsService: AdminNotificationsService) {}

  private assertAdminAccess(req: any) {
    if (req.user?.actorType !== 'midwife' || req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Get()
  async getDeliveryHealth(@Request() req: any, @Query() query: AdminNotificationsQuery) {
    this.assertAdminAccess(req);
    const data = await this.adminNotificationsService.getDeliveryHealth(query);
    return { success: true, data };
  }
}
