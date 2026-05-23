import { NotificationsService } from './notifications.service';
import { CreateTestNotificationDto, CreateTestPushDto, CreateTestWebPushDto, RegisterDeviceTokenDto, RegisterWebPushSubscriptionDto } from './dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    private getActor;
    private assertUserOrMidwife;
    private assertAdmin;
    registerDevice(req: any, dto: RegisterDeviceTokenDto): Promise<{
        success: boolean;
        data: {
            id: string;
            deviceId: string;
            token: string;
            actorType: import("@prisma/client").RecipientActorType;
            actorId: string;
            isActive: boolean;
            lastUsedAt: string | null;
            createdAt: string;
        };
    }>;
    registerSubscription(req: any, dto: RegisterWebPushSubscriptionDto): Promise<{
        success: boolean;
        data: {
            id: string;
            endpoint: string;
            actorType: import("@prisma/client").RecipientActorType;
            actorId: string;
            userAgent: string | null;
            isActive: boolean;
            createdAt: string;
            updatedAt: string;
        };
    }>;
    listNotifications(req: any): Promise<{
        success: boolean;
        data: import("./notifications.service").NotificationListItem[];
    }>;
    markRead(req: any, id: string): Promise<{
        success: boolean;
        data: import("./notifications.service").NotificationListItem;
    }>;
    createTestNotification(req: any, dto: CreateTestNotificationDto): Promise<{
        success: boolean;
        data: import("./notifications.service").NotificationListItem;
    }>;
    sendTestPush(req: any, dto: CreateTestPushDto): Promise<{
        success: boolean;
        data: import("./notifications.service").NotificationListItem;
    }>;
    sendTestWebPush(req: any, dto: CreateTestWebPushDto): Promise<{
        success: boolean;
        data: import("./notifications.service").NotificationListItem;
    }>;
}
