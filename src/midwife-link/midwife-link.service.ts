/**
 * Midwife Link Service
 * 
 * Handles QR link generation and profile linking to midwives.
 */

import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ClaimMidwifeLinkDto } from './dto';
import { MidwifeLinkProfileType } from '@prisma/client';

const QR_PREFIX = 'mch-midwife:';

@Injectable()
export class MidwifeLinkService {
  constructor(private readonly prisma: PrismaService) {}

  private createCode(): string {
    return randomBytes(16).toString('base64url');
  }

  async generate(midwifeId: string, profileType?: MidwifeLinkProfileType) {
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

  async claim(userId: string, dto: ClaimMidwifeLinkDto) {
    const link = await this.prisma.midwifeLinkCode.findFirst({
      where: { code: dto.code, isActive: true },
      include: { midwife: true },
    });

    if (!link) {
      throw new NotFoundException('QR code not found or expired');
    }

    if (!link.midwife) {
      throw new NotFoundException('Midwife not found');
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
      throw new BadRequestException(message);
    }

    if (dto.profileType === 'child') {
      const child = await this.prisma.child.findUnique({
        where: { id: dto.profileId },
      });

      if (!child) {
        throw new NotFoundException('Child not found');
      }

      if (child.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      if (!child.midwifeId) {
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
        throw new ForbiddenException('This child profile is unregistered. Ask your midwife to register you before scanning.');
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
        throw new ForbiddenException(message);
      }
    } else {
      const pregnancy = await this.prisma.pregnancy.findUnique({
        where: { id: dto.profileId },
      });

      if (!pregnancy) {
        throw new NotFoundException('Pregnancy profile not found');
      }

      if (pregnancy.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      if (!pregnancy.midwifeId) {
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
        throw new ForbiddenException('This pregnancy profile is unregistered. Ask your midwife to register you before scanning.');
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
        throw new ForbiddenException(message);
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

  async getStatus(midwifeId: string, code: string) {
    const link = await this.prisma.midwifeLinkCode.findFirst({
      where: { code, midwifeId },
    });

    if (!link) {
      throw new NotFoundException('QR code not found');
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

  async listNotifications(midwifeId: string, limit = 5) {
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
}
