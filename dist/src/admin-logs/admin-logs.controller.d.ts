import { AdminLogsService } from './admin-logs.service';
interface AdminLogsQuery {
    range?: string;
    level?: string;
    actorType?: string;
    source?: string;
    search?: string;
    page?: string;
    pageSize?: string;
}
export declare class AdminLogsController {
    private readonly adminLogsService;
    constructor(adminLogsService: AdminLogsService);
    private assertAdminAccess;
    getLogs(req: any, query: AdminLogsQuery): Promise<{
        success: boolean;
        data: {
            range: {
                label: string;
                start: string;
                end: string;
                days: number;
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
            page: number;
            pageSize: number;
            total: number;
            levelSummary: {
                level: import("@prisma/client").LogLevel;
                count: number;
            }[];
            actorSummary: {
                actorType: import("@prisma/client").LogActorType;
                count: number;
            }[];
        };
    }>;
}
export {};
