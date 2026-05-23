import { LogActorType, LogLevel, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
interface AdminLogsQuery {
    range?: string;
    level?: string;
    actorType?: string;
    source?: string;
    search?: string;
    page?: string;
    pageSize?: string;
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
type LogSummary = {
    level: LogLevel;
    count: number;
};
type ActorSummary = {
    actorType: LogActorType;
    count: number;
};
type AdminLogsResponse = {
    range: {
        label: string;
        start: string;
        end: string;
        days: number;
    };
    items: AdminLogEntry[];
    page: number;
    pageSize: number;
    total: number;
    levelSummary: LogSummary[];
    actorSummary: ActorSummary[];
};
export declare class AdminLogsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private resolveRange;
    private buildDateRange;
    private parsePage;
    private parsePageSize;
    private parseLevel;
    private parseActorType;
    private buildDisplayName;
    getLogs(query: AdminLogsQuery): Promise<AdminLogsResponse>;
}
export {};
