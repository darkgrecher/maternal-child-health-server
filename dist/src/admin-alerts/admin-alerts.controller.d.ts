import { AdminAlertsService } from './admin-alerts.service';
interface AdminAlertsQuery {
    range?: string;
    limit?: string;
}
export declare class AdminAlertsController {
    private readonly adminAlertsService;
    constructor(adminAlertsService: AdminAlertsService);
    private assertAdminAccess;
    getAlerts(req: any, query: AdminAlertsQuery): Promise<{
        success: boolean;
        data: {
            range: {
                label: string;
                start: string;
                end: string;
                days: number;
            };
            system: {
                total: number;
                summary: {
                    warningCount: number;
                    errorCount: number;
                };
                items: {
                    id: string;
                    level: import("@prisma/client").LogLevel;
                    source: string;
                    event?: string | null;
                    message: string;
                    metadata?: import("@prisma/client/runtime/library").JsonValue | null;
                    actor: {
                        type: import("@prisma/client").LogActorType;
                        id?: string | null;
                        name?: string | null;
                        email?: string | null;
                    };
                    ipAddress?: string | null;
                    userAgent?: string | null;
                    createdAt: string;
                }[];
            };
            link: {
                total: number;
                summary: {
                    mismatchCount: number;
                    unregisteredCount: number;
                };
                items: {
                    id: string;
                    type: import("@prisma/client").MidwifeLinkNotificationType;
                    expectedProfileType: import("@prisma/client").MidwifeLinkProfileType;
                    scannedProfileType: import("@prisma/client").MidwifeLinkProfileType;
                    message: string;
                    createdAt: string;
                    isRead: boolean;
                    midwife: {
                        id: string;
                        name: string | null;
                        email: string | null;
                    } | null;
                }[];
            };
        };
    }>;
}
export {};
