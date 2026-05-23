import { IsDateString, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { NotificationChannel, NotificationType, Prisma } from '@prisma/client';

export class CreateTestNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  data?: Prisma.InputJsonObject;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
