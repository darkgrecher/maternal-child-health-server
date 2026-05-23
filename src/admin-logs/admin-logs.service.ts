import { Injectable } from '@nestjs/common';
import { LogActorType, LogLevel, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const RANGE_CONFIG: Record<string, { days: number; label: string }> = {
  '24h': { days: 1, label: 'Last 24 hours' },
  '7d': { days: 7, label: 'Last 7 days' },
  '30d': { days: 30, label: 'Last 30 days' },
  '90d': { days: 90, label: 'Last 90 days' },
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const LEVEL_OPTIONS: LogLevel[] = [LogLevel.debug, LogLevel.info, LogLevel.warn, LogLevel.error];
const ACTOR_OPTIONS: LogActorType[] = [LogActorType.system, LogActorType.user, LogActorType.midwife];

interface AdminLogsQuery {
  range?: string;
  level?: string;
  actorType?: string;
  source?: string;
  search?: string;
  page?: string;
  pageSize?: string;
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

type LogSummary = {
  level: LogLevel;
  count: number;
};

type ActorSummary = {
  actorType: LogActorType;
  count: number;
};

type AdminLogsResponse = {
  range: {
    label: string;
    start: string;
    end: string;
    days: number;
  };
  items: AdminLogEntry[];
  page: number;
  pageSize: number;
  total: number;
  levelSummary: LogSummary[];
  actorSummary: ActorSummary[];
};

type ActorRecord = {
  id: string;
  name: string | null;
  givenName: string | null;
  familyName: string | null;
  email: string;
};

@Injectable()
export class AdminLogsService {
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

  private parsePage(value?: string): number {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }

  private parsePageSize(value?: string): number {
    const parsed = Number.parseInt(value ?? '', 10);
    if (!Number.isFinite(parsed)) {
      return DEFAULT_PAGE_SIZE;
    }
    return Math.min(Math.max(parsed, 5), MAX_PAGE_SIZE);
  }

  private parseLevel(value?: string): LogLevel | null {
    const normalized = (value || '').toLowerCase();
    if (!normalized) {
      return null;
    }
    const candidate = normalized as LogLevel;
    return LEVEL_OPTIONS.includes(candidate) ? candidate : null;
  }

  private parseActorType(value?: string): LogActorType | null {
    const normalized = (value || '').toLowerCase();
    if (!normalized) {
      return null;
    }
    const candidate = normalized as LogActorType;
    return ACTOR_OPTIONS.includes(candidate) ? candidate : null;
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

  async getLogs(query: AdminLogsQuery): Promise<AdminLogsResponse> {
    const rangeConfig = this.resolveRange(query.range);
    const { start, end } = this.buildDateRange(rangeConfig.days);

    const level = this.parseLevel(query.level);
    const actorType = this.parseActorType(query.actorType);
    const source = query.source?.trim();
    const search = query.search?.trim();

    const where: Prisma.SystemLogWhereInput = {
      createdAt: {
        gte: start,
        lte: end,
      },
    };

    if (level) {
      where.level = level;
    }

    if (actorType) {
      where.actorType = actorType;
    }

    if (source) {
      where.source = {
        contains: source,
        mode: 'insensitive',
      };
    }

    if (search) {
      where.OR = [
        { message: { contains: search, mode: 'insensitive' } },
        { source: { contains: search, mode: 'insensitive' } },
        { event: { contains: search, mode: 'insensitive' } },
        { actorId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const page = this.parsePage(query.page);
    const pageSize = this.parsePageSize(query.pageSize);
    const skip = (page - 1) * pageSize;

    const [total, logs, levelSummaryRaw, actorSummaryRaw] = await Promise.all([
      this.prisma.systemLog.count({ where }),
      this.prisma.systemLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.systemLog.groupBy({
        by: ['level'],
        where,
        _count: { _all: true },
      }),
      this.prisma.systemLog.groupBy({
        by: ['actorType'],
        where,
        _count: { _all: true },
      }),
    ]);

    const midwifeIds = new Set<string>();
    const userIds = new Set<string>();

    logs.forEach((log) => {
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

    const items: AdminLogEntry[] = logs.map((log) => {
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

    return {
      range: {
        label: rangeConfig.label,
        start: start.toISOString(),
        end: end.toISOString(),
        days: rangeConfig.days,
      },
      items,
      page,
      pageSize,
      total,
      levelSummary: levelSummaryRaw.map((entry) => ({
        level: entry.level,
        count: entry._count._all,
      })),
      actorSummary: actorSummaryRaw.map((entry) => ({
        actorType: entry.actorType,
        count: entry._count._all,
      })),
    };
  }
}
