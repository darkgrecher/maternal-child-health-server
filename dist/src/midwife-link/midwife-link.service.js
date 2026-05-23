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
exports.MidwifeLinkService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const QR_PREFIX = 'mch-midwife:';
let MidwifeLinkService = class MidwifeLinkService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    createCode() {
        return (0, crypto_1.randomBytes)(16).toString('base64url');
    }
    async generate(midwifeId, profileType) {
        const resolvedProfileType = profileType ?? 'any';
        await this.prisma.midwifeLinkCode.updateMany({
            where: { midwifeId, isActive: true },
            data: { isActive: false },
        });
        const code = this.createCode();
        const record = await this.prisma.midwifeLinkCode.create({
            data: {
                midwifeId,
                code,
                profileType: resolvedProfileType,
            },
        });
        return {
            code: record.code,
            profileType: record.profileType,
            qrPayload: `${QR_PREFIX}${record.profileType}:${record.code}`,
            createdAt: record.createdAt.toISOString(),
        };
    }
    async claim(userId, dto) {
        const link = await this.prisma.midwifeLinkCode.findFirst({
            where: { code: dto.code, isActive: true },
            include: { midwife: true },
        });
        if (!link) {
            throw new common_1.NotFoundException('QR code not found or expired');
        }
        if (!link.midwife) {
            throw new common_1.NotFoundException('Midwife not found');
        }
        const resolvedProfileType = link.profileType === 'any' ? dto.profileType : link.profileType;
        if (link.profileType !== 'any' && link.profileType !== dto.profileType) {
            const message = `QR code is for ${link.profileType} profiles. Open the scanner from the ${link.profileType} section.`;
            await this.prisma.midwifeLinkNotification.create({
                data: {
                    midwifeId: link.midwifeId,
                    linkCodeId: link.id,
                    type: 'mismatch',
                    expectedProfileType: link.profileType,
                    scannedProfileType: dto.profileType,
                    message,
                },
            });
            throw new common_1.BadRequestException(message);
        }
        const isProfileSpecific = link.profileType !== 'any';
        if (dto.profileType === 'child') {
            let child = await this.prisma.child.findUnique({
                where: { id: dto.profileId },
            });
            if (!child) {
                throw new common_1.NotFoundException('Child not found');
            }
            if (child.userId !== userId) {
                throw new common_1.ForbiddenException('Access denied');
            }
            if (!child.midwifeId) {
                if (isProfileSpecific) {
                    child = await this.prisma.child.update({
                        where: { id: child.id },
                        data: { midwifeId: link.midwifeId },
                    });
                }
                else {
                    const message = 'Unregistered child profile attempted to link.';
                    await this.prisma.midwifeLinkNotification.create({
                        data: {
                            midwifeId: link.midwifeId,
                            linkCodeId: link.id,
                            type: 'unregistered',
                            expectedProfileType: resolvedProfileType,
                            scannedProfileType: dto.profileType,
                            message,
                        },
                    });
                    throw new common_1.ForbiddenException('This child profile is unregistered. Ask your midwife to register you before scanning.');
                }
            }
            if (child.midwifeId !== link.midwifeId) {
                const message = 'Child already assigned to a different midwife.';
                await this.prisma.midwifeLinkNotification.create({
                    data: {
                        midwifeId: link.midwifeId,
                        linkCodeId: link.id,
                        type: 'unregistered',
                        expectedProfileType: resolvedProfileType,
                        scannedProfileType: dto.profileType,
                        message,
                    },
                });
                throw new common_1.ForbiddenException(message);
            }
        }
        else {
            let pregnancy = await this.prisma.pregnancy.findUnique({
                where: { id: dto.profileId },
            });
            if (!pregnancy) {
                throw new common_1.NotFoundException('Pregnancy profile not found');
            }
            if (pregnancy.userId !== userId) {
                throw new common_1.ForbiddenException('Access denied');
            }
            if (!pregnancy.midwifeId) {
                if (isProfileSpecific) {
                    pregnancy = await this.prisma.pregnancy.update({
                        where: { id: pregnancy.id },
                        data: { midwifeId: link.midwifeId },
                    });
                }
                else {
                    const message = 'Unregistered pregnancy profile attempted to link.';
                    await this.prisma.midwifeLinkNotification.create({
                        data: {
                            midwifeId: link.midwifeId,
                            linkCodeId: link.id,
                            type: 'unregistered',
                            expectedProfileType: resolvedProfileType,
                            scannedProfileType: dto.profileType,
                            message,
                        },
                    });
                    throw new common_1.ForbiddenException('This pregnancy profile is unregistered. Ask your midwife to register you before scanning.');
                }
            }
            if (pregnancy.midwifeId !== link.midwifeId) {
                const message = 'Pregnancy already assigned to a different midwife.';
                await this.prisma.midwifeLinkNotification.create({
                    data: {
                        midwifeId: link.midwifeId,
                        linkCodeId: link.id,
                        type: 'unregistered',
                        expectedProfileType: resolvedProfileType,
                        scannedProfileType: dto.profileType,
                        message,
                    },
                });
                throw new common_1.ForbiddenException(message);
            }
        }
        await this.prisma.midwifeLinkCode.update({
            where: { id: link.id },
            data: {
                lastUsedAt: new Date(),
                isActive: false,
                lastProfileId: dto.profileId,
                profileType: resolvedProfileType,
            },
        });
        return {
            profileType: dto.profileType,
            profileId: dto.profileId,
            midwife: {
                id: link.midwife.id,
                name: link.midwife.name,
                phone: link.midwife.phone,
                facilityName: link.midwife.facilityName,
                region: link.midwife.region,
            },
        };
    }
    async getStatus(midwifeId, code) {
        const link = await this.prisma.midwifeLinkCode.findFirst({
            where: { code, midwifeId },
        });
        if (!link) {
            throw new common_1.NotFoundException('QR code not found');
        }
        const latestNotification = await this.prisma.midwifeLinkNotification.findFirst({
            where: { linkCodeId: link.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                type: true,
                message: true,
                createdAt: true,
            },
        });
        return {
            code: link.code,
            profileType: link.profileType,
            isActive: link.isActive,
            lastUsedAt: link.lastUsedAt?.toISOString() ?? null,
            profileId: link.lastProfileId ?? null,
            notification: latestNotification
                ? {
                    id: latestNotification.id,
                    type: latestNotification.type,
                    message: latestNotification.message,
                    createdAt: latestNotification.createdAt.toISOString(),
                }
                : null,
        };
    }
    async listNotifications(midwifeId, limit = 5) {
        const notifications = await this.prisma.midwifeLinkNotification.findMany({
            where: { midwifeId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        return notifications.map((notification) => ({
            id: notification.id,
            type: notification.type,
            expectedProfileType: notification.expectedProfileType,
            scannedProfileType: notification.scannedProfileType,
            message: notification.message,
            createdAt: notification.createdAt.toISOString(),
            isRead: notification.isRead,
        }));
    }
};
exports.MidwifeLinkService = MidwifeLinkService;
exports.MidwifeLinkService = MidwifeLinkService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MidwifeLinkService);
//# sourceMappingURL=midwife-link.service.js.map