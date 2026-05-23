import { Controller, ForbiddenException, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { AdminLogsService } from './admin-logs.service';

interface AdminLogsQuery {
  range?: string;
  level?: string;
  actorType?: string;
  source?: string;
  search?: string;
  page?: string;
  pageSize?: string;
}

@Controller('admin/logs')
@UseGuards(JwtAuthGuard)
export class AdminLogsController {
  constructor(private readonly adminLogsService: AdminLogsService) {}

  private assertAdminAccess(req: any) {
    if (req.user?.actorType !== 'midwife' || req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Get()
  async getLogs(@Request() req: any, @Query() query: AdminLogsQuery) {
    this.assertAdminAccess(req);
    const data = await this.adminLogsService.getLogs(query);
    return { success: true, data };
  }
}
