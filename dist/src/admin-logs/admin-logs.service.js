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
exports.AdminLogsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const RANGE_CONFIG = {
    '24h': { days: 1, label: 'Last 24 hours' },
    '7d': { days: 7, label: 'Last 7 days' },
    '30d': { days: 30, label: 'Last 30 days' },
    '90d': { days: 90, label: 'Last 90 days' },
};
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const LEVEL_OPTIONS = [client_1.LogLevel.debug, client_1.LogLevel.info, client_1.LogLevel.warn, client_1.LogLevel.error];
const ACTOR_OPTIONS = [client_1.LogActorType.system, client_1.LogActorType.user, client_1.LogActorType.midwife];
let AdminLogsService = class AdminLogsService {
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
    parsePage(value) {
        const parsed = Number.parseInt(value ?? '', 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    }
    parsePageSize(value) {
        const parsed = Number.parseInt(value ?? '', 10);
        if (!Number.isFinite(parsed)) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.min(Math.max(parsed, 5), MAX_PAGE_SIZE);
    }
    parseLevel(value) {
        const normalized = (value || '').toLowerCase();
        if (!normalized) {
            return null;
        }
        const candidate = normalized;
        return LEVEL_OPTIONS.includes(candidate) ? candidate : null;
    }
    parseActorType(value) {
        const normalized = (value || '').toLowerCase();
        if (!normalized) {
            return null;
        }
        const candidate = normalized;
        return ACTOR_OPTIONS.includes(candidate) ? candidate : null;
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
    async getLogs(query) {
        const rangeConfig = this.resolveRange(query.range);
        const { start, end } = this.buildDateRange(rangeConfig.days);
        const level = this.parseLevel(query.level);
        const actorType = this.parseActorType(query.actorType);
        const source = query.source?.trim();
        const search = query.search?.trim();
        const where = {
            createdAt: {
                gte: start,
                lte: end,
            },
        };
        if (level) {
            where.level = level;
        }
        if (actorType) {
            where.actorType = actorType;
        }
        if (source) {
            where.source = {
                contains: source,
                mode: 'insensitive',
            };
        }
        if (search) {
            where.OR = [
                { message: { contains: search, mode: 'insensitive' } },
                { source: { contains: search, mode: 'insensitive' } },
                { event: { contains: search, mode: 'insensitive' } },
                { actorId: { contains: search, mode: 'insensitive' } },
            ];
        }
        const page = this.parsePage(query.page);
        const pageSize = this.parsePageSize(query.pageSize);
        const skip = (page - 1) * pageSize;
        const [total, logs, levelSummaryRaw, actorSummaryRaw] = await Promise.all([
            this.prisma.systemLog.count({ where }),
            this.prisma.systemLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            this.prisma.systemLog.groupBy({
                by: ['level'],
                where,
                _count: { _all: true },
            }),
            this.prisma.systemLog.groupBy({
                by: ['actorType'],
                where,
                _count: { _all: true },
            }),
        ]);
        const midwifeIds = new Set();
        const userIds = new Set();
        logs.forEach((log) => {
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
        const items = logs.map((log) => {
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
        return {
            range: {
                label: rangeConfig.label,
                start: start.toISOString(),
                end: end.toISOString(),
                days: rangeConfig.days,
            },
            items,
            page,
            pageSize,
            total,
            levelSummary: levelSummaryRaw.map((entry) => ({
                level: entry.level,
                count: entry._count._all,
            })),
            actorSummary: actorSummaryRaw.map((entry) => ({
                actorType: entry.actorType,
                count: entry._count._all,
            })),
        };
    }
};
exports.AdminLogsService = AdminLogsService;
exports.AdminLogsService = AdminLogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminLogsService);
//# sourceMappingURL=admin-logs.service.js.map