import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto, UpdateActivityDto } from './dto';

type ActorContext = {
  id: string;
  actorType: 'user' | 'midwife';
};

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  private async assertChildAccess(actor: ActorContext, childId: string) {
    const child = await this.prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    if (actor.actorType === 'midwife') {
      if (child.midwifeId !== actor.id) {
        throw new ForbiddenException('Access denied');
      }
    } else if (child.userId !== actor.id) {
      throw new ForbiddenException('Access denied');
    }

    return child;
  }

  private async assertActivityAccess(actor: ActorContext, id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: { child: true },
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    if (actor.actorType === 'midwife') {
      if (activity.child.midwifeId !== actor.id) {
        throw new ForbiddenException('Access denied');
      }
    } else if (activity.child.userId !== actor.id) {
      throw new ForbiddenException('Access denied');
    }

    return activity;
  }

  /**
   * Get all activities for the current actor
   */
  async getActorActivities(actor: ActorContext) {
    return this.prisma.activity.findMany({
      where: {
        child: actor.actorType === 'midwife'
          ? { midwifeId: actor.id }
          : { userId: actor.id },
      },
      include: {
        child: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Get all activities for a child
   */
  async getChildActivities(actor: ActorContext, childId: string) {
    await this.assertChildAccess(actor, childId);

    return this.prisma.activity.findMany({
      where: { childId },
      orderBy: { date: 'desc' },
      include: {
        child: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  /**
   * Get a single activity
   */
  async getActivity(actor: ActorContext, id: string) {
    return this.assertActivityAccess(actor, id);
  }

  /**
   * Create a new activity
   */
  async createActivity(actor: ActorContext, childId: string, dto: CreateActivityDto) {
    await this.assertChildAccess(actor, childId);
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
  async updateActivity(actor: ActorContext, id: string, dto: UpdateActivityDto) {
    await this.assertActivityAccess(actor, id);

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
  async deleteActivity(actor: ActorContext, id: string) {
    await this.assertActivityAccess(actor, id);

    await this.prisma.activity.delete({
      where: { id },
    });

    return { message: 'Activity deleted successfully' };
  }
}
