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
exports.AppointmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AppointmentService = class AppointmentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getChildAppointments(childId) {
        const child = await this.prisma.child.findUnique({
            where: { id: childId },
        });
        if (!child) {
            throw new common_1.NotFoundException('Child not found');
        }
        const appointments = await this.prisma.appointment.findMany({
            where: { childId },
            orderBy: { dateTime: 'desc' },
        });
        const now = new Date();
        const upcoming = appointments.filter((apt) => new Date(apt.dateTime) >= now && apt.status === 'scheduled');
        const past = appointments.filter((apt) => new Date(apt.dateTime) < now || apt.status !== 'scheduled');
        return {
            childId,
            childName: `${child.firstName} ${child.lastName}`,
            appointments,
            upcoming: upcoming.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()),
            past: past.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()),
            summary: {
                totalAppointments: appointments.length,
                upcomingCount: upcoming.length,
                completedCount: appointments.filter((a) => a.status === 'completed').length,
                cancelledCount: appointments.filter((a) => a.status === 'cancelled').length,
                nextAppointment: upcoming.length > 0 ? upcoming[0] : null,
            },
        };
    }
    async getAppointment(appointmentId) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { child: true },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        return appointment;
    }
    async createAppointment(childId, dto) {
        const child = await this.prisma.child.findUnique({
            where: { id: childId },
        });
        if (!child) {
            throw new common_1.NotFoundException('Child not found');
        }
        const appointment = await this.prisma.appointment.create({
            data: {
                childId,
                title: dto.title,
                type: dto.type,
                dateTime: new Date(dto.dateTime),
                duration: dto.duration,
                location: dto.location,
                address: dto.address,
                providerName: dto.providerName,
                providerRole: dto.providerRole,
                providerPhone: dto.providerPhone,
                notes: dto.notes,
                status: 'scheduled',
            },
        });
        return appointment;
    }
    async updateAppointment(appointmentId, dto) {
        const existing = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        const appointment = await this.prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                ...(dto.title && { title: dto.title }),
                ...(dto.type && { type: dto.type }),
                ...(dto.dateTime && { dateTime: new Date(dto.dateTime) }),
                ...(dto.duration !== undefined && { duration: dto.duration }),
                ...(dto.location && { location: dto.location }),
                ...(dto.address !== undefined && { address: dto.address }),
                ...(dto.providerName !== undefined && { providerName: dto.providerName }),
                ...(dto.providerRole !== undefined && { providerRole: dto.providerRole }),
                ...(dto.providerPhone !== undefined && { providerPhone: dto.providerPhone }),
                ...(dto.status && { status: dto.status }),
                ...(dto.notes !== undefined && { notes: dto.notes }),
                ...(dto.reminderSent !== undefined && { reminderSent: dto.reminderSent }),
            },
        });
        return appointment;
    }
    async cancelAppointment(appointmentId) {
        const existing = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        const appointment = await this.prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: 'cancelled' },
        });
        return appointment;
    }
    async completeAppointment(appointmentId) {
        const existing = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        const appointment = await this.prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: 'completed' },
        });
        return appointment;
    }
    async deleteAppointment(appointmentId) {
        const existing = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        await this.prisma.appointment.delete({
            where: { id: appointmentId },
        });
        return { success: true, message: 'Appointment deleted successfully' };
    }
    async getUserUpcomingAppointments(userId) {
        const now = new Date();
        const appointments = await this.prisma.appointment.findMany({
            where: {
                child: { userId },
                dateTime: { gte: now },
                status: 'scheduled',
            },
            include: {
                child: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { dateTime: 'asc' },
            take: 10,
        });
        return appointments;
    }
};
exports.AppointmentService = AppointmentService;
exports.AppointmentService = AppointmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppointmentService);
//# sourceMappingURL=appointment.service.js.map