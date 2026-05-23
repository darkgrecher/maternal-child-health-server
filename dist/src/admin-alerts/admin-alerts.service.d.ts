import { LogActorType, LogLevel, MidwifeLinkNotificationType, MidwifeLinkProfileType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
interface AdminAlertsQuery {
    range?: string;
    limit?: string;
}
type LogActor = {
    type: LogActorType;
    id?: string | null;
    name?: string | null;
    email?: string | null;
};
type AdminLogEntry = {
    id: string;
    level: LogLevel;
    source: string;
    event?: string | null;
    message: string;
    metadata?: Prisma.JsonValue | null;
    actor: LogActor;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: string;
};
type AdminLinkNotification = {
    id: string;
    type: MidwifeLinkNotificationType;
    expectedProfileType: MidwifeLinkProfileType;
    scannedProfileType: MidwifeLinkProfileType;
    message: string;
    createdAt: string;
    isRead: boolean;
    midwife: {
        id: string;
        name: string | null;
        email: string | null;
    } | null;
};
type AlertSummary = {
    warningCount: number;
    errorCount: number;
};
type LinkSummary = {
    mismatchCount: number;
    unregisteredCount: number;
};
type AdminAlertsResponse = {
    range: {
        label: string;
        start: string;
        end: string;
        days: number;
    };
    system: {
        total: number;
        summary: AlertSummary;
        items: AdminLogEntry[];
    };
    link: {
        total: number;
        summary: LinkSummary;
        items: AdminLinkNotification[];
    };
};
export declare class AdminAlertsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private resolveRange;
    private buildDateRange;
    private parseLimit;
    private buildDisplayName;
    getAlerts(query: AdminAlertsQuery): Promise<AdminAlertsResponse>;
}
export {};
