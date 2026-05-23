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
exports.AdminAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const RANGE_CONFIG = {
    '24h': { days: 1, label: 'Last 24 hours' },
    '7d': { days: 7, label: 'Last 7 days' },
    '30d': { days: 30, label: 'Last 30 days' },
    '90d': { days: 90, label: 'Last 90 days' },
};
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let AdminAnalyticsService = class AdminAnalyticsService {
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
        const previousEnd = new Date(start.getTime() - 1);
        const previousStart = new Date(previousEnd);
        previousStart.setDate(previousStart.getDate() - (days - 1));
        previousStart.setHours(0, 0, 0, 0);
        return { start, end, previousStart, previousEnd };
    }
    dateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    formatLabel(date) {
        return `${MONTH_LABELS[date.getMonth()]} ${date.getDate()}`;
    }
    buildBuckets(start, days) {
        const buckets = [];
        for (let i = 0; i < days; i += 1) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            buckets.push(day);
        }
        return buckets;
    }
    buildSeries(values, buckets) {
        const counts = new Map();
        values.forEach((value) => {
            const key = this.dateKey(value);
            counts.set(key, (counts.get(key) ?? 0) + 1);
        });
        return buckets.map((bucket) => counts.get(this.dateKey(bucket)) ?? 0);
    }
    buildTrend(current, previous) {
        if (previous === 0) {
            return {
                current,
                previous,
                changePercent: current === 0 ? 0 : null,
                direction: current === 0 ? 'flat' : 'up',
            };
        }
        const delta = current - previous;
        const changePercent = Math.round((delta / previous) * 100);
        const direction = delta === 0 ? 'flat' : delta > 0 ? 'up' : 'down';
        return { current, previous, changePercent, direction };
    }
    normalizeRegion(value) {
        const trimmed = value?.trim();
        return trimmed ? trimmed : 'Unassigned';
    }
    async getAnalytics(range) {
        const rangeConfig = this.resolveRange(range);
        const { start, end, previousStart, previousEnd } = this.buildDateRange(rangeConfig.days);
        const buckets = this.buildBuckets(start, rangeConfig.days);
        const labels = buckets.map((bucket) => this.formatLabel(bucket));
        const [totalUsers, totalMidwives, totalChildren, totalPregnancies, activePregnancies, highRiskPregnancies, overdueVaccinations, appointmentsInRange, vaccinationsInRange, newUsersPrevious, newMidwivesPrevious, newChildrenPrevious, newPregnanciesPrevious, appointmentsPrevious, vaccinationsPrevious, newUsersRange, newMidwivesRange, newChildrenRange, newPregnanciesRange, appointmentDates, vaccinationDates,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.midwife.count(),
            this.prisma.child.count(),
            this.prisma.pregnancy.count(),
            this.prisma.pregnancy.count({ where: { status: 'active' } }),
            this.prisma.pregnancy.count({ where: { status: 'active', isHighRisk: true } }),
            this.prisma.vaccinationRecord.count({
                where: { status: { in: ['overdue', 'missed'] } },
            }),
            this.prisma.appointment.count({
                where: { dateTime: { gte: start, lte: end } },
            }),
            this.prisma.vaccinationRecord.count({
                where: { administeredDate: { gte: start, lte: end } },
            }),
            this.prisma.user.count({
                where: { createdAt: { gte: previousStart, lte: previousEnd } },
            }),
            this.prisma.midwife.count({
                where: { createdAt: { gte: previousStart, lte: previousEnd } },
            }),
            this.prisma.child.count({
                where: { createdAt: { gte: previousStart, lte: previousEnd } },
            }),
            this.prisma.pregnancy.count({
                where: { createdAt: { gte: previousStart, lte: previousEnd } },
            }),
            this.prisma.appointment.count({
                where: { dateTime: { gte: previousStart, lte: previousEnd } },
            }),
            this.prisma.vaccinationRecord.count({
                where: { administeredDate: { gte: previousStart, lte: previousEnd } },
            }),
            this.prisma.user.findMany({
                where: { createdAt: { gte: start, lte: end } },
                select: { createdAt: true },
            }),
            this.prisma.midwife.findMany({
                where: { createdAt: { gte: start, lte: end } },
                select: { createdAt: true },
            }),
            this.prisma.child.findMany({
                where: { createdAt: { gte: start, lte: end } },
                select: { createdAt: true },
            }),
            this.prisma.pregnancy.findMany({
                where: { createdAt: { gte: start, lte: end } },
                select: { createdAt: true },
            }),
            this.prisma.appointment.findMany({
                where: { dateTime: { gte: start, lte: end } },
                select: { dateTime: true },
            }),
            this.prisma.vaccinationRecord.findMany({
                where: { administeredDate: { gte: start, lte: end } },
                select: { administeredDate: true },
            }),
        ]);
        const summary = {
            totalUsers,
            totalMidwives,
            totalChildren,
            totalPregnancies,
            activePregnancies,
            highRiskPregnancies,
            overdueVaccinations,
            appointmentsInRange,
            vaccinationsInRange,
        };
        const trends = {
            newUsers: this.buildTrend(newUsersRange.length, newUsersPrevious),
            newMidwives: this.buildTrend(newMidwivesRange.length, newMidwivesPrevious),
            newChildren: this.buildTrend(newChildrenRange.length, newChildrenPrevious),
            newPregnancies: this.buildTrend(newPregnanciesRange.length, newPregnanciesPrevious),
            appointments: this.buildTrend(appointmentsInRange, appointmentsPrevious),
            vaccinations: this.buildTrend(vaccinationsInRange, vaccinationsPrevious),
        };
        const series = {
            labels,
            newUsers: this.buildSeries(newUsersRange.map((record) => record.createdAt), buckets),
            newChildren: this.buildSeries(newChildrenRange.map((record) => record.createdAt), buckets),
            newPregnancies: this.buildSeries(newPregnanciesRange.map((record) => record.createdAt), buckets),
            appointments: this.buildSeries(appointmentDates.map((record) => record.dateTime), buckets),
            vaccinations: this.buildSeries(vaccinationDates
                .map((record) => record.administeredDate)
                .filter((date) => Boolean(date)), buckets),
        };
        const midwives = await this.prisma.midwife.findMany({
            select: { id: true, region: true },
        });
        const regionMap = new Map();
        const midwifeRegion = new Map();
        midwives.forEach((midwife) => {
            const region = this.normalizeRegion(midwife.region);
            midwifeRegion.set(midwife.id, region);
            const current = regionMap.get(region) ?? {
                region,
                midwives: 0,
                children: 0,
                pregnancies: 0,
            };
            current.midwives += 1;
            regionMap.set(region, current);
        });
        const [childrenByMidwife, pregnanciesByMidwife, unassignedChildren, unassignedPregnancies] = await Promise.all([
            this.prisma.child.groupBy({
                by: ['midwifeId'],
                _count: { _all: true },
                where: { midwifeId: { not: null } },
            }),
            this.prisma.pregnancy.groupBy({
                by: ['midwifeId'],
                _count: { _all: true },
                where: { midwifeId: { not: null } },
            }),
            this.prisma.child.count({ where: { midwifeId: null } }),
            this.prisma.pregnancy.count({ where: { midwifeId: null } }),
        ]);
        childrenByMidwife.forEach((group) => {
            const region = group.midwifeId ? midwifeRegion.get(group.midwifeId) : 'Unassigned';
            const bucket = regionMap.get(region || 'Unassigned') ?? {
                region: region || 'Unassigned',
                midwives: 0,
                children: 0,
                pregnancies: 0,
            };
            bucket.children += group._count._all;
            regionMap.set(bucket.region, bucket);
        });
        pregnanciesByMidwife.forEach((group) => {
            const region = group.midwifeId ? midwifeRegion.get(group.midwifeId) : 'Unassigned';
            const bucket = regionMap.get(region || 'Unassigned') ?? {
                region: region || 'Unassigned',
                midwives: 0,
                children: 0,
                pregnancies: 0,
            };
            bucket.pregnancies += group._count._all;
            regionMap.set(bucket.region, bucket);
        });
        if (unassignedChildren > 0 || unassignedPregnancies > 0) {
            const bucket = regionMap.get('Unassigned') ?? {
                region: 'Unassigned',
                midwives: 0,
                children: 0,
                pregnancies: 0,
            };
            bucket.children += unassignedChildren;
            bucket.pregnancies += unassignedPregnancies;
            regionMap.set('Unassigned', bucket);
        }
        const regionStats = Array.from(regionMap.values()).sort((a, b) => b.midwives - a.midwives);
        const vaccinationStatus = await this.prisma.vaccinationRecord.groupBy({
            by: ['status'],
            _count: { _all: true },
        });
        const vaccinationStatusStats = vaccinationStatus.map((item) => ({
            status: String(item.status),
            count: item._count._all,
        }));
        const recentActivities = await this.prisma.activity.findMany({
            orderBy: { date: 'desc' },
            take: 8,
            include: {
                child: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        const recentActivityItems = recentActivities.map((activity) => ({
            id: activity.id,
            type: activity.type,
            title: activity.title,
            description: activity.description,
            date: activity.date.toISOString(),
            childId: activity.childId,
            childName: `${activity.child.firstName} ${activity.child.lastName}`.trim(),
        }));
        return {
            range: {
                label: rangeConfig.label,
                start: start.toISOString(),
                end: end.toISOString(),
                days: rangeConfig.days,
            },
            summary,
            trends,
            series,
            regionStats,
            vaccinationStatus: vaccinationStatusStats,
            recentActivities: recentActivityItems,
        };
    }
};
exports.AdminAnalyticsService = AdminAnalyticsService;
exports.AdminAnalyticsService = AdminAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminAnalyticsService);
//# sourceMappingURL=admin-analytics.service.js.map