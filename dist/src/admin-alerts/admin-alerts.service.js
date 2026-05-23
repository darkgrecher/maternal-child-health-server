"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAlertsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const RANGE_CONFIG = {
    '24h': { days: 1, label: 'Last 24 hours' },
    '7d': { days: 7, label: 'Last 7 days' },
    '30d': { days: 30, label: 'Last 30 days' },
    '90d': { days: 90, label: 'Last 90 days' },
};
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const ALERT_LEVELS = [client_1.LogLevel.warn, client_1.LogLevel.error];
let AdminAlertsService = class AdminAlertsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    resolveRange(range) {
        const normalized = (range || '').toLowerCase();
        return RANGE_CONFIG[normalized] ?? RANGE_CONFIG['30d'];
    }
    buildDateRange(days) {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        const start = new Date(end);
        start.setDate(start.getDate() - (days - 1));
        start.setHours(0, 0, 0, 0);
        return { start, end };
    }
    parseLimit(value) {
        const parsed = Number.parseInt(value ?? '', 10);
        if (!Number.isFinite(parsed)) {
            return DEFAULT_LIMIT;
        }
        return Math.min(Math.max(parsed, 5), MAX_LIMIT);
    }
    buildDisplayName(actor) {
        const directName = actor.name?.trim();
        if (directName) {
            return directName;
        }
        const givenName = actor.givenName?.trim();
        const familyName = actor.familyName?.trim();
        const composite = [givenName, familyName].filter(Boolean).join(' ');
        return composite || actor.email;
    }
    async getAlerts(query) {
        const rangeConfig = this.resolveRange(query.range);
        const { start, end } = this.buildDateRange(rangeConfig.days);
        const limit = this.parseLimit(query.limit);
        const systemWhere = {
            createdAt: {
                gte: start,
                lte: end,
            },
            level: {
                in: ALERT_LEVELS,
            },
        };
        const linkWhere = {
            createdAt: {
                gte: start,
                lte: end,
            },
        };
        const [systemTotal, systemLogs, systemSummaryRaw, linkTotal, linkNotifications, linkSummaryRaw,] = await Promise.all([
            this.prisma.systemLog.count({ where: systemWhere }),
            this.prisma.systemLog.findMany({
                where: systemWhere,
                orderBy: { createdAt: 'desc' },
                take: limit,
            }),
            this.prisma.systemLog.groupBy({
                by: ['level'],
                where: systemWhere,
                _count: { _all: true },
            }),
            this.prisma.midwifeLinkNotification.count({ where: linkWhere }),
            this.prisma.midwifeLinkNotification.findMany({
                where: linkWhere,
                orderBy: { createdAt: 'desc' },
                take: limit,
                select: {
                    id: true,
                    type: true,
                    expectedProfileType: true,
                    scannedProfileType: true,
                    message: true,
                    createdAt: true,
                    isRead: true,
                    midwifeId: true,
                },
            }),
            this.prisma.midwifeLinkNotification.groupBy({
                by: ['type'],
                where: linkWhere,
                _count: { _all: true },
            }),
        ]);
        const midwifeIds = new Set();
        const userIds = new Set();
        systemLogs.forEach((log) => {
            if (log.actorType === client_1.LogActorType.midwife && log.actorId) {
                midwifeIds.add(log.actorId);
            }
            if (log.actorType === client_1.LogActorType.user && log.actorId) {
                userIds.add(log.actorId);
            }
        });
        const [midwives, users] = await Promise.all([
            midwifeIds.size
                ? this.prisma.midwife.findMany({
                    where: { id: { in: Array.from(midwifeIds) } },
                    select: {
                        id: true,
                        name: true,
                        givenName: true,
                        familyName: true,
                        email: true,
                    },
                })
                : Promise.resolve([]),
            userIds.size
                ? this.prisma.user.findMany({
                    where: { id: { in: Array.from(userIds) } },
                    select: {
                        id: true,
                        name: true,
                        givenName: true,
                        familyName: true,
                        email: true,
                    },
                })
                : Promise.resolve([]),
        ]);
        const midwifeMap = new Map(midwives.map((midwife) => [midwife.id, midwife]));
        const userMap = new Map(users.map((user) => [user.id, user]));
        const systemItems = systemLogs.map((log) => {
            let actor = { type: log.actorType };
            if (log.actorType === client_1.LogActorType.midwife && log.actorId) {
                const midwife = midwifeMap.get(log.actorId);
                actor = {
                    type: log.actorType,
                    id: log.actorId,
                    name: midwife ? this.buildDisplayName(midwife) : null,
                    email: midwife?.email ?? null,
                };
            }
            if (log.actorType === client_1.LogActorType.user && log.actorId) {
                const user = userMap.get(log.actorId);
                actor = {
                    type: log.actorType,
                    id: log.actorId,
                    name: user ? this.buildDisplayName(user) : null,
                    email: user?.email ?? null,
                };
            }
            if (log.actorType === client_1.LogActorType.system) {
                actor = { type: log.actorType };
            }
            return {
                id: log.id,
                level: log.level,
                source: log.source,
                event: log.event,
                message: log.message,
                metadata: log.metadata,
                actor,
                ipAddress: log.ipAddress,
                userAgent: log.userAgent,
                createdAt: log.createdAt.toISOString(),
            };
        });
        const linkNotificationsTyped = linkNotifications;
        const linkMidwifeIds = new Set(linkNotificationsTyped.map((notification) => notification.midwifeId));
        const linkMidwives = linkMidwifeIds.size
            ? await this.prisma.midwife.findMany({
                where: { id: { in: Array.from(linkMidwifeIds) } },
                select: {
                    id: true,
                    name: true,
                    givenName: true,
                    familyName: true,
                    email: true,
                },
            })
            : [];
        const linkMidwifeMap = new Map(linkMidwives.map((midwife) => [midwife.id, midwife]));
        const linkItems = linkNotificationsTyped.map((notification) => {
            const midwife = linkMidwifeMap.get(notification.midwifeId);
            return {
                id: notification.id,
                type: notification.type,
                expectedProfileType: notification.expectedProfileType,
                scannedProfileType: notification.scannedProfileType,
                message: notification.message,
                createdAt: notification.createdAt.toISOString(),
                isRead: notification.isRead,
                midwife: midwife
                    ? {
                        id: midwife.id,
                        name: this.buildDisplayName(midwife),
                        email: midwife.email,
                    }
                    : null,
            };
        });
        const warningCount = systemSummaryRaw.find((entry) => entry.level === client_1.LogLevel.warn)?._count._all ?? 0;
        const errorCount = systemSummaryRaw.find((entry) => entry.level === client_1.LogLevel.error)?._count._all ?? 0;
        const mismatchCount = linkSummaryRaw.find((entry) => entry.type === client_1.MidwifeLinkNotificationType.mismatch)?._count
            ._all ?? 0;
        const unregisteredCount = linkSummaryRaw.find((entry) => entry.type === client_1.MidwifeLinkNotificationType.unregistered)?._count
            ._all ?? 0;
        return {
            range: {
                label: rangeConfig.label,
                start: start.toISOString(),
                end: end.toISOString(),
                days: rangeConfig.days,
            },
            system: {
                total: systemTotal,
                summary: {
                    warningCount,
                    errorCount,
                },
                items: systemItems,
            },
            link: {
                total: linkTotal,
                summary: {
                    mismatchCount,
                    unregisteredCount,
                },
                items: linkItems,
            },
        };
    }
};
exports.AdminAlertsService = AdminAlertsService;
exports.AdminAlertsService = AdminAlertsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminAlertsService);
//# sourceMappingURL=admin-alerts.service.js.map