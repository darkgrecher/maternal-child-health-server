import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto, UpdateActivityDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';

@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  /**
   * Get all activities for a child
   */
  @Get('child/:childId')
  async getChildActivities(@Param('childId') childId: string) {
    const activities = await this.activityService.getChildActivities(childId);
    return {
      success: true,
      data: activities,
    };
  }

  /**
   * Get a single activity
   */
  @Get(':id')
  async getActivity(@Param('id') id: string) {
    const activity = await this.activityService.getActivity(id);
    return {
      success: true,
      data: activity,
    };
  }

  /**
   * Create a new activity
   */
  @Post('child/:childId')
  async createActivity(
    @Param('childId') childId: string,
    @Body() dto: CreateActivityDto,
  ) {
    const activity = await this.activityService.createActivity(childId, dto);
    return {
      success: true,
      data: activity,
    };
  }

  /**
   * Update an activity
   */
  @Put(':id')
  async updateActivity(@Param('id') id: string, @Body() dto: UpdateActivityDto) {
    const activity = await this.activityService.updateActivity(id, dto);
    return {
      success: true,
      data: activity,
    };
  }

  /**
   * Delete an activity
   */
  @Delete(':id')
  async deleteActivity(@Param('id') id: string) {
    const result = await this.activityService.deleteActivity(id);
    return {
      success: true,
      ...result,
    };
  }
}
