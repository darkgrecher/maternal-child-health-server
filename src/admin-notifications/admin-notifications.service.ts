import { Injectable } from '@nestjs/common';
import { NotificationChannel, NotificationType, Prisma, RecipientActorType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const RANGE_CONFIG: Record<string, { days: number; label: string }> = {
  '24h': { days: 1, label: 'Last 24 hours' },
  '7d': { days: 7, label: 'Last 7 days' },
  '30d': { days: 30, label: 'Last 30 days' },
  '90d': { days: 90, label: 'Last 90 days' },
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

interface AdminNotificationsQuery {
  range?: string;
  limit?: string;
}

type AdminNotificationDeliveryItem = {
  id: string;
  notificationId: string;
  actorType: RecipientActorType;
  actorId: string;
  actor: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  channel: NotificationChannel;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  deliveredAt: string | null;
  deliveryError: string | null;
};

type DeliverySummary = {
  byChannel: { channel: NotificationChannel; count: number }[];
  byActorType: { actorType: RecipientActorType; count: number }[];
  byType: { type: NotificationType; count: number }[];
};

type AdminNotificationDeliveryHealthResponse = {
  range: {
    label: string;
    start: string;
    end: string;
    days: number;
  };
  totalFailed: number;
  summary: DeliverySummary;
  items: AdminNotificationDeliveryItem[];
};

type ActorRecord = {
  id: string;
  name: string | null;
  givenName: string | null;
  familyName: string | null;
  email: string;
};

@Injectable()
export class AdminNotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  private resolveRange(range?: string) {
    const normalized = (range || '').toLowerCase();
    return RANGE_CONFIG[normalized] ?? RANGE_CONFIG['30d'];
  }

  private buildDateRange(days: number) {
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    return { start, end };
  }

  private parseLimit(value?: string): number {
    const parsed = Number.parseInt(value ?? '', 10);
    if (!Number.isFinite(parsed)) {
      return DEFAULT_LIMIT;
    }
    return Math.min(Math.max(parsed, 5), MAX_LIMIT);
  }

  private buildDisplayName(actor: ActorRecord): string {
    const directName = actor.name?.trim();
    if (directName) {
      return directName;
    }

    const givenName = actor.givenName?.trim();
    const familyName = actor.familyName?.trim();
    const composite = [givenName, familyName].filter(Boolean).join(' ');
    return composite || actor.email;
  }

  async getDeliveryHealth(query: AdminNotificationsQuery): Promise<AdminNotificationDeliveryHealthResponse> {
    const rangeConfig = this.resolveRange(query.range);
    const { start, end } = this.buildDateRange(rangeConfig.days);
    const limit = this.parseLimit(query.limit);

    const where: Prisma.NotificationRecipientWhereInput = {
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

    const channelCounts = new Map<NotificationChannel, number>();
    const typeCounts = new Map<NotificationType, number>();
    const actorCounts = new Map<RecipientActorType, number>();

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

    const midwifeIds = new Set<string>();
    const userIds = new Set<string>();

    itemsRaw.forEach((record) => {
      if (record.actorType === RecipientActorType.midwife) {
        midwifeIds.add(record.actorId);
      }
      if (record.actorType === RecipientActorType.user) {
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
        : Promise.resolve([] as ActorRecord[]),
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
        : Promise.resolve([] as ActorRecord[]),
    ]);

    const midwifeMap = new Map<string, ActorRecord>(
      midwives.map((midwife): [string, ActorRecord] => [midwife.id, midwife]),
    );
    const userMap = new Map<string, ActorRecord>(
      users.map((user): [string, ActorRecord] => [user.id, user]),
    );

    const items: AdminNotificationDeliveryItem[] = itemsRaw.map((record) => {
      const actorRecord =
        record.actorType === RecipientActorType.midwife
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
}
