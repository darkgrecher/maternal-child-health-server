import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto, UpdateActivityDto } from './dto';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all activities for a child
   */
  async getChildActivities(childId: string) {
    const activities = await this.prisma.activity.findMany({
      where: { childId },
      orderBy: { date: 'desc' },
    });

    return activities;
  }

  /**
   * Get a single activity
   */
  async getActivity(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    return activity;
  }

  /**
   * Create a new activity
   */
  async createActivity(childId: string, dto: CreateActivityDto) {
    const activity = await this.prisma.activity.create({
      data: {
        childId,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : new Date(),
        icon: dto.icon,
      },
    });

    return activity;
  }

  /**
   * Update an activity
   */
  async updateActivity(id: string, dto: UpdateActivityDto) {
    // Check if activity exists
    await this.getActivity(id);

    const activity = await this.prisma.activity.update({
      where: { id },
      data: {
        ...(dto.type && { type: dto.type }),
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
      },
    });

    return activity;
  }

  /**
   * Delete an activity
   */
  async deleteActivity(id: string) {
    // Check if activity exists
    await this.getActivity(id);

    await this.prisma.activity.delete({
      where: { id },
    });

    return { message: 'Activity deleted successfully' };
  }
}
