import { Injectable } from '@nestjs/common';
import {
  LogActorType,
  LogLevel,
  MidwifeLinkNotificationType,
  MidwifeLinkProfileType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const RANGE_CONFIG: Record<string, { days: number; label: string }> = {
  '24h': { days: 1, label: 'Last 24 hours' },
  '7d': { days: 7, label: 'Last 7 days' },
  '30d': { days: 30, label: 'Last 30 days' },
  '90d': { days: 90, label: 'Last 90 days' },
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const ALERT_LEVELS: LogLevel[] = [LogLevel.warn, LogLevel.error];

interface AdminAlertsQuery {
  range?: string;
  limit?: string;
}

type LogActor = {
  type: LogActorType;
  id?: string | null;
  name?: string | null;
  email?: string | null;
};

type AdminLogEntry = {
  id: string;
  level: LogLevel;
  source: string;
  event?: string | null;
  message: string;
  metadata?: Prisma.JsonValue | null;
  actor: LogActor;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
};

type AdminLinkNotification = {
  id: string;
  type: MidwifeLinkNotificationType;
  expectedProfileType: MidwifeLinkProfileType;
  scannedProfileType: MidwifeLinkProfileType;
  message: string;
  createdAt: string;
  isRead: boolean;
  midwife: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
};

type AlertSummary = {
  warningCount: number;
  errorCount: number;
};

type LinkSummary = {
  mismatchCount: number;
  unregisteredCount: number;
};

type AdminAlertsResponse = {
  range: {
    label: string;
    start: string;
    end: string;
    days: number;
  };
  system: {
    total: number;
    summary: AlertSummary;
    items: AdminLogEntry[];
  };
  link: {
    total: number;
    summary: LinkSummary;
    items: AdminLinkNotification[];
  };
};

type ActorRecord = {
  id: string;
  name: string | null;
  givenName: string | null;
  familyName: string | null;
  email: string;
};

type LinkNotificationRecord = {
  id: string;
  type: MidwifeLinkNotificationType;
  expectedProfileType: MidwifeLinkProfileType;
  scannedProfileType: MidwifeLinkProfileType;
  message: string;
  createdAt: Date;
  isRead: boolean;
  midwifeId: string;
};

@Injectable()
export class AdminAlertsService {
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

  async getAlerts(query: AdminAlertsQuery): Promise<AdminAlertsResponse> {
    const rangeConfig = this.resolveRange(query.range);
    const { start, end } = this.buildDateRange(rangeConfig.days);
    const limit = this.parseLimit(query.limit);

    const systemWhere: Prisma.SystemLogWhereInput = {
      createdAt: {
        gte: start,
        lte: end,
      },
      level: {
        in: ALERT_LEVELS,
      },
    };

    const linkWhere: Prisma.MidwifeLinkNotificationWhereInput = {
      createdAt: {
        gte: start,
        lte: end,
      },
    };

    const [
      systemTotal,
      systemLogs,
      systemSummaryRaw,
      linkTotal,
      linkNotifications,
      linkSummaryRaw,
    ] = await Promise.all([
      this.prisma.systemLog.count({ where: systemWhere }),
      this.prisma.systemLog.findMany({
        where: systemWhere,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      this.prisma.systemLog.groupBy({
        by: ['level'],
        where: systemWhere,
        _count: { _all: true },
      }),
      this.prisma.midwifeLinkNotification.count({ where: linkWhere }),
      this.prisma.midwifeLinkNotification.findMany({
        where: linkWhere,
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          type: true,
          expectedProfileType: true,
          scannedProfileType: true,
          message: true,
          createdAt: true,
          isRead: true,
          midwifeId: true,
        },
      }),
      this.prisma.midwifeLinkNotification.groupBy({
        by: ['type'],
        where: linkWhere,
        _count: { _all: true },
      }),
    ]);

    const midwifeIds = new Set<string>();
    const userIds = new Set<string>();

    systemLogs.forEach((log) => {
      if (log.actorType === LogActorType.midwife && log.actorId) {
        midwifeIds.add(log.actorId);
      }
      if (log.actorType === LogActorType.user && log.actorId) {
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
      midwives.map((midwife): [string, ActorRecord] => [midwife.id, midwife])
    );
    const userMap = new Map<string, ActorRecord>(
      users.map((user): [string, ActorRecord] => [user.id, user])
    );

    const systemItems: AdminLogEntry[] = systemLogs.map((log) => {
      let actor: LogActor = { type: log.actorType };

      if (log.actorType === LogActorType.midwife && log.actorId) {
        const midwife = midwifeMap.get(log.actorId);
        actor = {
          type: log.actorType,
          id: log.actorId,
          name: midwife ? this.buildDisplayName(midwife) : null,
          email: midwife?.email ?? null,
        };
      }

      if (log.actorType === LogActorType.user && log.actorId) {
        const user = userMap.get(log.actorId);
        actor = {
          type: log.actorType,
          id: log.actorId,
          name: user ? this.buildDisplayName(user) : null,
          email: user?.email ?? null,
        };
      }

      if (log.actorType === LogActorType.system) {
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

    const linkNotificationsTyped = linkNotifications as LinkNotificationRecord[];
    const linkMidwifeIds = new Set(linkNotificationsTyped.map((notification) => notification.midwifeId));

    const linkMidwives = linkMidwifeIds.size
      ? await this.prisma.midwife.findMany({
          where: { id: { in: Array.from(linkMidwifeIds) } },
          select: {
            id: true,
            name: true,
            givenName: true,
            familyName: true,
            email: true,
          },
        })
      : [];

    const linkMidwifeMap = new Map<string, ActorRecord>(
      linkMidwives.map((midwife): [string, ActorRecord] => [midwife.id, midwife])
    );

    const linkItems: AdminLinkNotification[] = linkNotificationsTyped.map((notification) => {
      const midwife = linkMidwifeMap.get(notification.midwifeId);
      return {
        id: notification.id,
        type: notification.type,
        expectedProfileType: notification.expectedProfileType,
        scannedProfileType: notification.scannedProfileType,
        message: notification.message,
        createdAt: notification.createdAt.toISOString(),
        isRead: notification.isRead,
        midwife: midwife
          ? {
              id: midwife.id,
              name: this.buildDisplayName(midwife),
              email: midwife.email,
            }
          : null,
      };
    });

    const warningCount =
      systemSummaryRaw.find((entry) => entry.level === LogLevel.warn)?._count._all ?? 0;
    const errorCount =
      systemSummaryRaw.find((entry) => entry.level === LogLevel.error)?._count._all ?? 0;

    const mismatchCount =
      linkSummaryRaw.find((entry) => entry.type === MidwifeLinkNotificationType.mismatch)?._count
        ._all ?? 0;
    const unregisteredCount =
      linkSummaryRaw.find((entry) => entry.type === MidwifeLinkNotificationType.unregistered)?._count
        ._all ?? 0;

    return {
      range: {
        label: rangeConfig.label,
        start: start.toISOString(),
        end: end.toISOString(),
        days: rangeConfig.days,
      },
      system: {
        total: systemTotal,
        summary: {
          warningCount,
          errorCount,
        },
        items: systemItems,
      },
      link: {
        total: linkTotal,
        summary: {
          mismatchCount,
          unregisteredCount,
        },
        items: linkItems,
      },
    };
  }
}
