import { NotificationChannel, NotificationType, RecipientActorType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
interface AdminNotificationsQuery {
    range?: string;
    limit?: string;
}
type AdminNotificationDeliveryItem = {
    id: string;
    notificationId: string;
    actorType: RecipientActorType;
    actorId: string;
    actor: {
        id: string;
        name: string | null;
        email: string | null;
    } | null;
    channel: NotificationChannel;
    type: NotificationType;
    title: string;
    message: string;
    createdAt: string;
    deliveredAt: string | null;
    deliveryError: string | null;
};
type DeliverySummary = {
    byChannel: {
        channel: NotificationChannel;
        count: number;
    }[];
    byActorType: {
        actorType: RecipientActorType;
        count: number;
    }[];
    byType: {
        type: NotificationType;
        count: number;
    }[];
};
type AdminNotificationDeliveryHealthResponse = {
    range: {
        label: string;
        start: string;
        end: string;
        days: number;
    };
    totalFailed: number;
    summary: DeliverySummary;
    items: AdminNotificationDeliveryItem[];
};
export declare class AdminNotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private resolveRange;
    private buildDateRange;
    private parseLimit;
    private buildDisplayName;
    getDeliveryHealth(query: AdminNotificationsQuery): Promise<AdminNotificationDeliveryHealthResponse>;
}
export {};
