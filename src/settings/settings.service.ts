import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto';

export interface SettingsProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  licenseNumber: string | null;
  facilityName: string | null;
  region: string | null;
  picture: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface SettingsPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  dateFormat: string;
  notifications: {
    appointments: boolean;
    vaccinations: boolean;
    highRisk: boolean;
    dailyDigest: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
}

export interface SettingsStats {
  patientsManaged: number;
  appointmentsThisMonth: number;
  vaccinationsAdministered: number;
}

export interface SettingsPayload {
  profile: SettingsProfile;
  preferences: SettingsPreferences;
  stats: SettingsStats;
}

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(midwifeId: string): Promise<SettingsPayload> {
    const midwife = await this.prisma.midwife.findUnique({
      where: { id: midwifeId },
    });

    if (!midwife) {
      throw new NotFoundException('Midwife not found');
    }

    const stats = await this.getStats(midwifeId);

    return {
      profile: this.mapProfile(midwife),
      preferences: this.mapPreferences(midwife),
      stats,
    };
  }

  async updateSettings(midwifeId: string, dto: UpdateSettingsDto): Promise<SettingsPayload> {
    const midwife = await this.prisma.midwife.findUnique({
      where: { id: midwifeId },
    });

    if (!midwife) {
      throw new NotFoundException('Midwife not found');
    }

    const data: Record<string, unknown> = {};

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
          throw new BadRequestException('Email is required');
        }
        if (email !== midwife.email) {
          const existing = await this.prisma.midwife.findUnique({
            where: { email },
          });
          if (existing) {
            throw new BadRequestException('Email already in use');
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

  private mapProfile(midwife: any): SettingsProfile {
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

  private mapPreferences(midwife: any): SettingsPreferences {
    return {
      theme: (midwife.theme ?? 'system') as SettingsPreferences['theme'],
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

  private async getStats(midwifeId: string): Promise<SettingsStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [childCount, pregnancyCount, appointmentsThisMonth, vaccinationsAdministered] =
      await Promise.all([
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
}
