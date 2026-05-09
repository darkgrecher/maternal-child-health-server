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

  async generate(midwifeId: string, profileType: MidwifeLinkProfileType) {
    await this.prisma.midwifeLinkCode.updateMany({
      where: { midwifeId, isActive: true },
      data: { isActive: false },
    });

    const code = this.createCode();
    const record = await this.prisma.midwifeLinkCode.create({
      data: {
        midwifeId,
        code,
        profileType,
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

    if (link.profileType !== dto.profileType) {
      const message = `QR code is for ${link.profileType} profiles. Open the scanner from the ${link.profileType} section.`;
      await this.prisma.midwifeLinkNotification.create({
        data: {
          midwifeId: link.midwifeId,
          linkCodeId: link.id,
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

      if (child.midwifeId && child.midwifeId !== link.midwifeId) {
        throw new ForbiddenException('Child already assigned to a midwife');
      }

      if (child.midwifeId !== link.midwifeId) {
        await this.prisma.child.update({
          where: { id: child.id },
          data: { midwifeId: link.midwifeId },
        });
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

      if (pregnancy.midwifeId && pregnancy.midwifeId !== link.midwifeId) {
        throw new ForbiddenException('Pregnancy already assigned to a midwife');
      }

      if (pregnancy.midwifeId !== link.midwifeId) {
        await this.prisma.pregnancy.update({
          where: { id: pregnancy.id },
          data: { midwifeId: link.midwifeId },
        });
      }
    }

    await this.prisma.midwifeLinkCode.update({
      where: { id: link.id },
      data: { lastUsedAt: new Date(), isActive: false },
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

    return {
      code: link.code,
      profileType: link.profileType,
      isActive: link.isActive,
      lastUsedAt: link.lastUsedAt?.toISOString() ?? null,
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
