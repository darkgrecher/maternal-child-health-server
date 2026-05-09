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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const MS_PER_DAY = 1000 * 60 * 60 * 24;
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getChildScope(actor) {
        return actor.actorType === 'midwife'
            ? { midwifeId: actor.id }
            : { userId: actor.id };
    }
    getPregnancyScope(actor) {
        return actor.actorType === 'midwife'
            ? { midwifeId: actor.id }
            : { userId: actor.id };
    }
    formatChildName(child) {
        return `${child.firstName} ${child.lastName}`.trim();
    }
    formatMotherName(pregnancy) {
        return `${pregnancy.motherFirstName} ${pregnancy.motherLastName}`.trim();
    }
    formatAgeLabel(dateOfBirth) {
        const today = new Date();
        const days = Math.floor((today.getTime() - dateOfBirth.getTime()) / MS_PER_DAY);
        const months = Math.floor(days / 30.44);
        if (months < 12) {
            return `${Math.max(0, months)} months`;
        }
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        return remainingMonths > 0 ? `${years} years ${remainingMonths} mo` : `${years} years`;
    }
    async getOverdueVaccinations(actor, limit = 5) {
        const childScope = this.getChildScope(actor);
        const children = await this.prisma.child.findMany({
            where: childScope,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                dateOfBirth: true,
                motherName: true,
                fatherName: true,
                emergencyContact: true,
            },
        });
        if (children.length === 0) {
            return { items: [], count: 0 };
        }
        const vaccines = await this.prisma.vaccine.findMany({
            where: { isActive: true },
            orderBy: [
                { sortOrder: 'asc' },
                { scheduledAgeMonths: 'asc' },
                { doseNumber: 'asc' },
            ],
        });
        if (vaccines.length === 0) {
            return { items: [], count: 0 };
        }
        const childIds = children.map((child) => child.id);
        const records = await this.prisma.vaccinationRecord.findMany({
            where: { childId: { in: childIds } },
            select: {
                childId: true,
                vaccineId: true,
                status: true,
                scheduledDate: true,
                vaccine: {
                    select: { id: true, name: true },
                },
            },
        });
        const recordMap = new Map();
        records.forEach((record) => {
            recordMap.set(`${record.childId}:${record.vaccineId}`, record);
        });
        const today = new Date();
        const overdueItems = [];
        for (const child of children) {
            const childDob = new Date(child.dateOfBirth);
            for (const vaccine of vaccines) {
                const scheduledDate = new Date(childDob);
                scheduledDate.setMonth(scheduledDate.getMonth() + vaccine.scheduledAgeMonths);
                if (vaccine.scheduledAgeDays) {
                    scheduledDate.setDate(scheduledDate.getDate() + vaccine.scheduledAgeDays);
                }
                const record = recordMap.get(`${child.id}:${vaccine.id}`);
                const dueDate = record?.scheduledDate ?? scheduledDate;
                const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / MS_PER_DAY);
                const status = record?.status;
                const isRecordMarkedOverdue = status === 'overdue' || status === 'missed';
                if (!isRecordMarkedOverdue && daysOverdue <= 30) {
                    continue;
                }
                const isOverdue = record
                    ? isRecordMarkedOverdue || status === 'pending' || status === 'scheduled'
                    : daysOverdue > 30;
                if (!isOverdue) {
                    continue;
                }
                overdueItems.push({
                    childId: child.id,
                    childName: this.formatChildName(child),
                    childAge: this.formatAgeLabel(childDob),
                    vaccineId: vaccine.id,
                    vaccineName: record?.vaccine?.name ?? vaccine.name,
                    scheduledDate: dueDate.toISOString(),
                    daysOverdue: Math.max(0, daysOverdue),
                    parentPhone: child.emergencyContact,
                });
            }
        }
        overdueItems.sort((a, b) => b.daysOverdue - a.daysOverdue);
        return {
            items: overdueItems.slice(0, limit),
            count: overdueItems.length,
        };
    }
    async getDashboard(actor) {
        const childScope = this.getChildScope(actor);
        const pregnancyScope = this.getPregnancyScope(actor);
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);
        const endOfWeek = new Date(now);
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        endOfWeek.setHours(23, 59, 59, 999);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const [childrenCount, activePregnanciesCount, highRiskPregnanciesCount, appointmentsTodayCount, upcomingAppointmentsCount, newChildrenCount, newPregnanciesCount,] = await Promise.all([
            this.prisma.child.count({ where: childScope }),
            this.prisma.pregnancy.count({
                where: { ...pregnancyScope, status: 'active' },
            }),
            this.prisma.pregnancy.count({
                where: { ...pregnancyScope, status: 'active', isHighRisk: true },
            }),
            this.prisma.appointment.count({
                where: {
                    child: childScope,
                    dateTime: { gte: startOfToday, lte: endOfToday },
                },
            }),
            this.prisma.appointment.count({
                where: {
                    child: childScope,
                    dateTime: { gte: now, lte: endOfWeek },
                    status: 'scheduled',
                },
            }),
            this.prisma.child.count({
                where: { ...childScope, createdAt: { gte: startOfMonth, lte: endOfMonth } },
            }),
            this.prisma.pregnancy.count({
                where: { ...pregnancyScope, createdAt: { gte: startOfMonth, lte: endOfMonth } },
            }),
        ]);
        const [todayAppointments, recentActivities, highRiskPregnancies] = await Promise.all([
            this.prisma.appointment.findMany({
                where: {
                    child: childScope,
                    dateTime: { gte: startOfToday, lte: endOfToday },
                },
                include: {
                    child: { select: { id: true, firstName: true, lastName: true } },
                },
                orderBy: { dateTime: 'asc' },
                take: 20,
            }),
            this.prisma.activity.findMany({
                where: { child: childScope },
                include: {
                    child: { select: { id: true, firstName: true, lastName: true } },
                },
                orderBy: { date: 'desc' },
                take: 6,
            }),
            this.prisma.pregnancy.findMany({
                where: { ...pregnancyScope, status: 'active', isHighRisk: true },
                include: {
                    pregnancyCheckups: {
                        orderBy: { checkupDate: 'desc' },
                        take: 1,
                    },
                },
                orderBy: { expectedDeliveryDate: 'asc' },
                take: 5,
            }),
        ]);
        const { items: overdueVaccinations, count: overdueVaccinationsCount } = await this.getOverdueVaccinations(actor);
        const stats = {
            totalPatients: childrenCount + activePregnanciesCount,
            activePregnancies: activePregnanciesCount,
            childrenMonitored: childrenCount,
            upcomingAppointments: upcomingAppointmentsCount,
            overdueVaccinations: overdueVaccinationsCount,
            highRiskPregnancies: highRiskPregnanciesCount,
            appointmentsToday: appointmentsTodayCount,
            newPatientsThisMonth: newChildrenCount + newPregnanciesCount,
        };
        return {
            stats,
            todayAppointments: todayAppointments.map((appointment) => ({
                id: appointment.id,
                childId: appointment.childId,
                childName: this.formatChildName(appointment.child),
                dateTime: appointment.dateTime.toISOString(),
                type: appointment.type,
                status: appointment.status,
                title: appointment.title,
                location: appointment.location,
            })),
            recentActivities: recentActivities.map((activity) => ({
                id: activity.id,
                type: activity.type,
                title: activity.title,
                description: activity.description,
                date: activity.date.toISOString(),
                childId: activity.childId,
                childName: this.formatChildName(activity.child),
            })),
            highRiskPregnancies: highRiskPregnancies.map((pregnancy) => ({
                id: pregnancy.id,
                motherName: this.formatMotherName(pregnancy),
                currentWeek: pregnancy.currentWeek ?? null,
                riskFactors: pregnancy.riskFactors ?? [],
                expectedDeliveryDate: pregnancy.expectedDeliveryDate
                    ? pregnancy.expectedDeliveryDate.toISOString()
                    : null,
                nextCheckupDate: pregnancy.pregnancyCheckups[0]?.nextCheckupDate
                    ? pregnancy.pregnancyCheckups[0].nextCheckupDate.toISOString()
                    : null,
            })),
            overdueVaccinations,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map