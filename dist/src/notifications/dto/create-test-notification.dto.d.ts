import { NotificationChannel, NotificationType, Prisma } from '@prisma/client';
export declare class CreateTestNotificationDto {
    type: NotificationType;
    channel: NotificationChannel;
    title: string;
    message: string;
    data?: Prisma.InputJsonObject;
    scheduledAt?: string;
}
