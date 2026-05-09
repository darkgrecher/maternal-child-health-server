import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto, UpdateActivityDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';

@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  private getActor(req: any): { id: string; actorType: 'user' | 'midwife' } {
    return { id: req.user.sub, actorType: req.user.actorType || 'user' };
  }

  /**
   * Get all activities for the current actor
   * GET /activity
   */
  @Get()
  async getActivities(@Request() req) {
    const activities = await this.activityService.getActorActivities(this.getActor(req));
    return { success: true, data: activities };
  }

  /**
   * Get all activities for a child
   */
  @Get('child/:childId')
  async getChildActivities(@Request() req, @Param('childId') childId: string) {
    const activities = await this.activityService.getChildActivities(this.getActor(req), childId);
    return {
      success: true,
      data: activities,
    };
  }

  /**
   * Get a single activity
   */
  @Get(':id')
  async getActivity(@Request() req, @Param('id') id: string) {
    const activity = await this.activityService.getActivity(this.getActor(req), id);
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
    @Request() req,
    @Param('childId') childId: string,
    @Body() dto: CreateActivityDto,
  ) {
    const activity = await this.activityService.createActivity(this.getActor(req), childId, dto);
    return {
      success: true,
      data: activity,
    };
  }

  /**
   * Update an activity
   */
  @Put(':id')
  async updateActivity(@Request() req, @Param('id') id: string, @Body() dto: UpdateActivityDto) {
    const activity = await this.activityService.updateActivity(this.getActor(req), id, dto);
    return {
      success: true,
      data: activity,
    };
  }

  /**
   * Delete an activity
   */
  @Delete(':id')
  async deleteActivity(@Request() req, @Param('id') id: string) {
    const result = await this.activityService.deleteActivity(this.getActor(req), id);
    return {
      success: true,
      ...result,
    };
  }
}
