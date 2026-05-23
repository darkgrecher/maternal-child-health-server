import { NotificationChannel, NotificationType, Prisma, RecipientActorType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export type ActorContext = {
    id: string;
    actorType: RecipientActorType;
};
export type NotificationListItem = {
    id: string;
    recipientId: string;
    type: NotificationType;
    channel: NotificationChannel;
    title: string;
    message: string;
    data: Prisma.JsonValue | null;
    scheduledAt: string | null;
    sentAt: string | null;
    createdAt: string;
    isRead: boolean;
    readAt: string | null;
    deliveredAt: string | null;
    deliveryError: string | null;
};
type CreateNotificationInput = {
    type: NotificationType;
    channel: NotificationChannel;
    title: string;
    message: string;
    data?: Prisma.InputJsonValue | null;
    scheduledAt?: Date | null;
    sentAt?: Date | null;
};
type RecipientInput = {
    actorType: RecipientActorType;
    actorId: string;
};
type RegisterDeviceTokenInput = {
    deviceId: string;
    token: string;
    isActive?: boolean;
    lastUsedAt?: string;
};
type RegisterWebPushSubscriptionInput = {
    endpoint: string;
    p256dh: string;
    auth: string;
    userAgent?: string;
    isActive?: boolean;
};
type DeviceTokenResponse = {
    id: string;
    deviceId: string;
    token: string;
    actorType: RecipientActorType;
    actorId: string;
    isActive: boolean;
    lastUsedAt: string | null;
    createdAt: string;
};
type WebPushSubscriptionResponse = {
    id: string;
    endpoint: string;
    actorType: RecipientActorType;
    actorId: string;
    userAgent: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private mapNotificationRecipient;
    private mapDeviceToken;
    private mapSubscription;
    private parseDate;
    private getVapidConfig;
    private getRecipientForActor;
    createNotification(input: CreateNotificationInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        title: string;
        type: import("@prisma/client").$Enums.NotificationType;
        data: Prisma.JsonValue | null;
        channel: import("@prisma/client").$Enums.NotificationChannel;
        scheduledAt: Date | null;
        sentAt: Date | null;
    }>;
    createInAppNotificationForActor(actor: ActorContext, input: Omit<CreateNotificationInput, 'channel'>): Promise<{
        notification: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            message: string;
            title: string;
            type: import("@prisma/client").$Enums.NotificationType;
            data: Prisma.JsonValue | null;
            channel: import("@prisma/client").$Enums.NotificationChannel;
            scheduledAt: Date | null;
            sentAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        actorId: string;
        actorType: import("@prisma/client").$Enums.RecipientActorType;
        isRead: boolean;
        deliveryError: string | null;
        notificationId: string;
        readAt: Date | null;
        deliveredAt: Date | null;
    }>;
    addRecipients(notificationId: string, recipients: RecipientInput[]): Promise<({
        notification: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            message: string;
            title: string;
            type: import("@prisma/client").$Enums.NotificationType;
            data: Prisma.JsonValue | null;
            channel: import("@prisma/client").$Enums.NotificationChannel;
            scheduledAt: Date | null;
            sentAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        actorId: string;
        actorType: import("@prisma/client").$Enums.RecipientActorType;
        isRead: boolean;
        deliveryError: string | null;
        notificationId: string;
        readAt: Date | null;
        deliveredAt: Date | null;
    })[]>;
    createNotificationForActor(actor: ActorContext, input: CreateNotificationInput): Promise<NotificationListItem>;
    listNotificationsForActor(actor: ActorContext): Promise<NotificationListItem[]>;
    markRead(notificationId: string, actor: ActorContext): Promise<NotificationListItem>;
    private updateRecipientDelivery;
    recordRecipientDelivery(recipientId: string, delivery: {
        deliveredAt?: Date | null;
        deliveryError?: string | null;
    }): Promise<{
        notification: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            message: string;
            title: string;
            type: import("@prisma/client").$Enums.NotificationType;
            data: Prisma.JsonValue | null;
            channel: import("@prisma/client").$Enums.NotificationChannel;
            scheduledAt: Date | null;
            sentAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        actorId: string;
        actorType: import("@prisma/client").$Enums.RecipientActorType;
        isRead: boolean;
        deliveryError: string | null;
        notificationId: string;
        readAt: Date | null;
        deliveredAt: Date | null;
    }>;
    storeDeliveryError(notificationId: string, actor: ActorContext, error: string): Promise<void>;
    deliverExpoPushToActor(actor: ActorContext, input: {
        title: string;
        message: string;
        data?: Record<string, unknown>;
    }): Promise<{
        deliveredAt: null;
        deliveryError: string | null;
    }>;
    registerDeviceToken(actor: ActorContext, input: RegisterDeviceTokenInput): Promise<DeviceTokenResponse>;
    sendTestPushToActor(actor: ActorContext, input: {
        title: string;
        message: string;
        data?: Prisma.InputJsonObject;
    }): Promise<NotificationListItem>;
    registerWebPushSubscription(actor: ActorContext, input: RegisterWebPushSubscriptionInput): Promise<WebPushSubscriptionResponse>;
    sendTestWebPushToActor(actor: ActorContext, input: {
        title: string;
        message: string;
        data?: Prisma.InputJsonObject;
    }): Promise<NotificationListItem>;
}
export {};
