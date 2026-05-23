import { AdminNotificationsService } from './admin-notifications.service';
interface AdminNotificationsQuery {
    range?: string;
    limit?: string;
}
export declare class AdminNotificationsController {
    private readonly adminNotificationsService;
    constructor(adminNotificationsService: AdminNotificationsService);
    private assertAdminAccess;
    getDeliveryHealth(req: any, query: AdminNotificationsQuery): Promise<{
        success: boolean;
        data: {
            range: {
                label: string;
                start: string;
                end: string;
                days: number;
            };
            totalFailed: number;
            summary: {
                byChannel: {
                    channel: import("@prisma/client").NotificationChannel;
                    count: number;
                }[];
                byActorType: {
                    actorType: import("@prisma/client").RecipientActorType;
                    count: number;
                }[];
                byType: {
                    type: import("@prisma/client").NotificationType;
                    count: number;
                }[];
            };
            items: {
                id: string;
                notificationId: string;
                actorType: import("@prisma/client").RecipientActorType;
                actorId: string;
                actor: {
                    id: string;
                    name: string | null;
                    email: string | null;
                } | null;
                channel: import("@prisma/client").NotificationChannel;
                type: import("@prisma/client").NotificationType;
                title: string;
                message: string;
                createdAt: string;
                deliveredAt: string | null;
                deliveryError: string | null;
            }[];
        };
    }>;
}
export {};
