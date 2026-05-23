import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { AdminDistrictsService } from './admin-districts.service';
import { UpdateMidwifeRegionDto } from './dto';

@Controller('admin/districts')
@UseGuards(JwtAuthGuard)
export class AdminDistrictsController {
  constructor(private readonly adminDistrictsService: AdminDistrictsService) {}

  private assertAdminAccess(req: any) {
    if (req.user?.actorType !== 'midwife' || req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Get()
  async getDistricts(@Request() req: any) {
    this.assertAdminAccess(req);
    const data = await this.adminDistrictsService.getDistricts();
    return { success: true, data };
  }

  @Patch('midwives/:midwifeId')
  async updateMidwifeRegion(
    @Request() req: any,
    @Param('midwifeId') midwifeId: string,
    @Body() dto: UpdateMidwifeRegionDto
  ) {
    this.assertAdminAccess(req);
    const data = await this.adminDistrictsService.updateMidwifeRegion(midwifeId, dto);
    return { success: true, data };
  }
}
