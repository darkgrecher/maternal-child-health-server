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
exports.AdminNotificationsService = void 0;
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
let AdminNotificationsService = class AdminNotificationsService {
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
    async getDeliveryHealth(query) {
        const rangeConfig = this.resolveRange(query.range);
        const { start, end } = this.buildDateRange(rangeConfig.days);
        const limit = this.parseLimit(query.limit);
        const where = {
            createdAt: {
                gte: start,
                lte: end,
            },
            AND: [
                { deliveryError: { not: null } },
                { NOT: { deliveryError: '' } },
            ],
        };
        const [totalFailed, summaryRecords, itemsRaw] = await Promise.all([
            this.prisma.notificationRecipient.count({ where }),
            this.prisma.notificationRecipient.findMany({
                where,
                select: {
                    actorType: true,
                    notification: {
                        select: {
                            channel: true,
                            type: true,
                        },
                    },
                },
            }),
            this.prisma.notificationRecipient.findMany({
                where,
                include: { notification: true },
                orderBy: { createdAt: 'desc' },
                take: limit,
            }),
        ]);
        const channelCounts = new Map();
        const typeCounts = new Map();
        const actorCounts = new Map();
        summaryRecords.forEach((record) => {
            const channel = record.notification.channel;
            const type = record.notification.type;
            const actorType = record.actorType;
            channelCounts.set(channel, (channelCounts.get(channel) ?? 0) + 1);
            typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
            actorCounts.set(actorType, (actorCounts.get(actorType) ?? 0) + 1);
        });
        const byChannel = Array.from(channelCounts.entries()).map(([channel, count]) => ({
            channel,
            count,
        }));
        const byType = Array.from(typeCounts.entries()).map(([type, count]) => ({
            type,
            count,
        }));
        const byActorType = Array.from(actorCounts.entries()).map(([actorType, count]) => ({
            actorType,
            count,
        }));
        const midwifeIds = new Set();
        const userIds = new Set();
        itemsRaw.forEach((record) => {
            if (record.actorType === client_1.RecipientActorType.midwife) {
                midwifeIds.add(record.actorId);
            }
            if (record.actorType === client_1.RecipientActorType.user) {
                userIds.add(record.actorId);
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
        const items = itemsRaw.map((record) => {
            const actorRecord = record.actorType === client_1.RecipientActorType.midwife
                ? midwifeMap.get(record.actorId)
                : userMap.get(record.actorId);
            const actor = actorRecord
                ? {
                    id: actorRecord.id,
                    name: this.buildDisplayName(actorRecord),
                    email: actorRecord.email,
                }
                : null;
            return {
                id: record.id,
                notificationId: record.notificationId,
                actorType: record.actorType,
                actorId: record.actorId,
                actor,
                channel: record.notification.channel,
                type: record.notification.type,
                title: record.notification.title,
                message: record.notification.message,
                createdAt: record.createdAt.toISOString(),
                deliveredAt: record.deliveredAt ? record.deliveredAt.toISOString() : null,
                deliveryError: record.deliveryError ?? null,
            };
        });
        return {
            range: {
                label: rangeConfig.label,
                start: start.toISOString(),
                end: end.toISOString(),
                days: rangeConfig.days,
            },
            totalFailed,
            summary: {
                byChannel,
                byActorType,
                byType,
            },
            items,
        };
    }
};
exports.AdminNotificationsService = AdminNotificationsService;
exports.AdminNotificationsService = AdminNotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminNotificationsService);
//# sourceMappingURL=admin-notifications.service.js.map