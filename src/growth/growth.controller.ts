import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GrowthService } from './growth.service';
import { CreateGrowthMeasurementDto, UpdateGrowthMeasurementDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';

@Controller('growth')
@UseGuards(JwtAuthGuard)
export class GrowthController {
  constructor(private readonly growthService: GrowthService) {}

  /**
   * Get all growth measurements for a child
   */
  @Get('child/:childId')
  async getChildMeasurements(@Param('childId') childId: string) {
    const data = await this.growthService.getChildMeasurements(childId);
    return { success: true, data };
  }

  /**
   * Get chart data for growth visualization
   */
  @Get('child/:childId/chart')
  async getChartData(
    @Param('childId') childId: string,
    @Query('type') chartType: 'weight' | 'height' | 'head' = 'weight',
  ) {
    const data = await this.growthService.getChartData(childId, chartType);
    return { success: true, data };
  }

  /**
   * Add a new growth measurement
   */
  @Post('child/:childId')
  async addMeasurement(
    @Param('childId') childId: string,
    @Body() dto: CreateGrowthMeasurementDto,
  ) {
    const data = await this.growthService.addMeasurement(childId, dto);
    return { success: true, data };
  }

  /**
   * Update a growth measurement
   */
  @Patch(':measurementId')
  async updateMeasurement(
    @Param('measurementId') measurementId: string,
    @Body() dto: UpdateGrowthMeasurementDto,
  ) {
    const data = await this.growthService.updateMeasurement(measurementId, dto);
    return { success: true, data };
  }

  /**
   * Delete a growth measurement
   */
  @Delete(':measurementId')
  async deleteMeasurement(@Param('measurementId') measurementId: string) {
    const data = await this.growthService.deleteMeasurement(measurementId);
    return { success: true, data };
  }
}
