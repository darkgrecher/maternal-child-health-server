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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SettingsService = class SettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSettings(midwifeId) {
        const midwife = await this.prisma.midwife.findUnique({
            where: { id: midwifeId },
        });
        if (!midwife) {
            throw new common_1.NotFoundException('Midwife not found');
        }
        const stats = await this.getStats(midwifeId);
        return {
            profile: this.mapProfile(midwife),
            preferences: this.mapPreferences(midwife),
            stats,
        };
    }
    async updateSettings(midwifeId, dto) {
        const midwife = await this.prisma.midwife.findUnique({
            where: { id: midwifeId },
        });
        if (!midwife) {
            throw new common_1.NotFoundException('Midwife not found');
        }
        const data = {};
        if (dto.profile) {
            if (dto.profile.name !== undefined) {
                const name = dto.profile.name.trim();
                data.name = name.length ? name : null;
            }
            if (dto.profile.phone !== undefined) {
                const phone = dto.profile.phone.trim();
                data.phone = phone.length ? phone : null;
            }
            if (dto.profile.picture !== undefined) {
                const picture = dto.profile.picture.trim();
                data.picture = picture.length ? picture : null;
            }
            if (dto.profile.email !== undefined) {
                const email = dto.profile.email.trim().toLowerCase();
                if (!email.length) {
                    throw new common_1.BadRequestException('Email is required');
                }
                if (email !== midwife.email) {
                    const existing = await this.prisma.midwife.findUnique({
                        where: { email },
                    });
                    if (existing) {
                        throw new common_1.BadRequestException('Email already in use');
                    }
                    data.email = email;
                }
            }
        }
        if (dto.preferences) {
            if (dto.preferences.theme !== undefined) {
                data.theme = dto.preferences.theme;
            }
            if (dto.preferences.language !== undefined) {
                data.language = dto.preferences.language;
            }
            if (dto.preferences.dateFormat !== undefined) {
                data.dateFormat = dto.preferences.dateFormat;
            }
            if (dto.preferences.notifications) {
                const notifications = dto.preferences.notifications;
                if (notifications.appointments !== undefined) {
                    data.notifyAppointments = notifications.appointments;
                }
                if (notifications.vaccinations !== undefined) {
                    data.notifyVaccinations = notifications.vaccinations;
                }
                if (notifications.highRisk !== undefined) {
                    data.notifyHighRisk = notifications.highRisk;
                }
                if (notifications.dailyDigest !== undefined) {
                    data.notifyDailyDigest = notifications.dailyDigest;
                }
                if (notifications.emailNotifications !== undefined) {
                    data.notifyEmail = notifications.emailNotifications;
                }
                if (notifications.smsNotifications !== undefined) {
                    data.notifySms = notifications.smsNotifications;
                }
            }
        }
        const updated = Object.keys(data).length
            ? await this.prisma.midwife.update({
                where: { id: midwifeId },
                data,
            })
            : midwife;
        const stats = await this.getStats(midwifeId);
        return {
            profile: this.mapProfile(updated),
            preferences: this.mapPreferences(updated),
            stats,
        };
    }
    mapProfile(midwife) {
        return {
            id: midwife.id,
            name: midwife.name ?? null,
            email: midwife.email,
            phone: midwife.phone ?? null,
            role: midwife.role,
            licenseNumber: midwife.licenseNumber ?? null,
            facilityName: midwife.facilityName ?? null,
            region: midwife.region ?? null,
            picture: midwife.picture ?? null,
            createdAt: midwife.createdAt.toISOString(),
            updatedAt: midwife.updatedAt.toISOString(),
            lastLoginAt: midwife.lastLoginAt ? midwife.lastLoginAt.toISOString() : null,
        };
    }
    mapPreferences(midwife) {
        return {
            theme: (midwife.theme ?? 'system'),
            language: midwife.language ?? 'en',
            dateFormat: midwife.dateFormat ?? 'dmy',
            notifications: {
                appointments: midwife.notifyAppointments ?? true,
                vaccinations: midwife.notifyVaccinations ?? true,
                highRisk: midwife.notifyHighRisk ?? true,
                dailyDigest: midwife.notifyDailyDigest ?? false,
                emailNotifications: midwife.notifyEmail ?? true,
                smsNotifications: midwife.notifySms ?? false,
            },
        };
    }
    async getStats(midwifeId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const [childCount, pregnancyCount, appointmentsThisMonth, vaccinationsAdministered] = await Promise.all([
            this.prisma.child.count({ where: { midwifeId } }),
            this.prisma.pregnancy.count({ where: { midwifeId } }),
            this.prisma.appointment.count({
                where: {
                    child: { midwifeId },
                    dateTime: { gte: startOfMonth, lte: endOfMonth },
                },
            }),
            this.prisma.vaccinationRecord.count({
                where: {
                    child: { midwifeId },
                    administeredDate: { not: null },
                },
            }),
        ]);
        return {
            patientsManaged: childCount + pregnancyCount,
            appointmentsThisMonth,
            vaccinationsAdministered,
        };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map