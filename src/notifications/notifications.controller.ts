import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { NotificationsService } from './notifications.service';
import {
  CreateTestNotificationDto,
  CreateTestPushDto,
  CreateTestWebPushDto,
  RegisterDeviceTokenDto,
  RegisterWebPushSubscriptionDto,
} from './dto';
import { MidwifeRole } from '@prisma/client';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  private getActor(req: any): { id: string; actorType: 'user' | 'midwife'; role?: MidwifeRole } {
    const actorId = req.user?.sub;
    if (!actorId) {
      throw new BadRequestException('User ID not found in token. Please log out and log in again.');
    }
    return {
      id: actorId,
      actorType: req.user?.actorType || 'user',
      role: req.user?.role,
    };
  }

  private assertUserOrMidwife(actorType: string) {
    if (actorType !== 'user' && actorType !== 'midwife') {
      throw new ForbiddenException('User or midwife access required');
    }
  }

  private assertAdmin(actorType: string, role?: MidwifeRole) {
    if (actorType !== 'midwife' || role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Post('devices')
  @HttpCode(HttpStatus.CREATED)
  async registerDevice(@Request() req: any, @Body() dto: RegisterDeviceTokenDto) {
    const actor = this.getActor(req);
    this.assertUserOrMidwife(actor.actorType);

    const data = await this.notificationsService.registerDeviceToken(actor, {
      deviceId: dto.deviceId,
      token: dto.token,
      isActive: dto.isActive,
      lastUsedAt: dto.lastUsedAt,
    });

    return { success: true, data };
  }

  @Post('subscriptions')
  @HttpCode(HttpStatus.CREATED)
  async registerSubscription(@Request() req: any, @Body() dto: RegisterWebPushSubscriptionDto) {
    const actor = this.getActor(req);
    this.assertUserOrMidwife(actor.actorType);

    const data = await this.notificationsService.registerWebPushSubscription(actor, {
      endpoint: dto.endpoint,
      p256dh: dto.p256dh,
      auth: dto.auth,
      userAgent: dto.userAgent,
      isActive: dto.isActive,
    });

    return { success: true, data };
  }

  @Get()
  async listNotifications(@Request() req: any) {
    const actor = this.getActor(req);
    this.assertUserOrMidwife(actor.actorType);

    const data = await this.notificationsService.listNotificationsForActor(actor);
    return { success: true, data };
  }

  @Put(':id/read')
  async markRead(@Request() req: any, @Param('id') id: string) {
    const actor = this.getActor(req);
    this.assertUserOrMidwife(actor.actorType);

    const data = await this.notificationsService.markRead(id, actor);
    return { success: true, data };
  }

  @Post('test')
  @HttpCode(HttpStatus.CREATED)
  async createTestNotification(@Request() req: any, @Body() dto: CreateTestNotificationDto) {
    const actor = this.getActor(req);
    this.assertAdmin(actor.actorType, actor.role);

    const data = await this.notificationsService.createNotificationForActor(actor, {
      type: dto.type,
      channel: dto.channel,
      title: dto.title,
      message: dto.message,
      data: dto.data ?? undefined,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
    });

    return { success: true, data };
  }

  @Post('push/test')
  @HttpCode(HttpStatus.CREATED)
  async sendTestPush(@Request() req: any, @Body() dto: CreateTestPushDto) {
    const actor = this.getActor(req);
    this.assertUserOrMidwife(actor.actorType);

    const data = await this.notificationsService.sendTestPushToActor(actor, {
      title: dto.title,
      message: dto.message,
      data: dto.data,
    });

    return { success: true, data };
  }

  @Post('web-push/test')
  @HttpCode(HttpStatus.CREATED)
  async sendTestWebPush(@Request() req: any, @Body() dto: CreateTestWebPushDto) {
    const actor = this.getActor(req);
    this.assertUserOrMidwife(actor.actorType);

    const data = await this.notificationsService.sendTestWebPushToActor(actor, {
      title: dto.title,
      message: dto.message,
      data: dto.data,
    });

    return { success: true, data };
  }
}
