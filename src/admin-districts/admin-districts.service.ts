import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMidwifeRegionDto } from './dto';

const UNASSIGNED_LABEL = 'Unassigned';

export interface DistrictSummary {
  name: string;
  midwives: number;
  children: number;
  pregnancies: number;
}

export interface DistrictMidwife {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  licenseNumber: string | null;
  facilityName: string | null;
  region: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminDistrictsResponse {
  districts: DistrictSummary[];
  midwives: DistrictMidwife[];
}

type MidwifeRecord = {
  id: string;
  email: string;
  name: string | null;
  givenName: string | null;
  familyName: string | null;
  phone: string | null;
  licenseNumber: string | null;
  facilityName: string | null;
  region: string | null;
  createdAt: Date;
  lastLoginAt: Date | null;
};

@Injectable()
export class AdminDistrictsService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeRegion(value?: string | null): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private buildDisplayName(midwife: MidwifeRecord): string {
    const directName = midwife.name?.trim();
    if (directName) {
      return directName;
    }

    const givenName = midwife.givenName?.trim();
    const familyName = midwife.familyName?.trim();
    const composite = [givenName, familyName].filter(Boolean).join(' ');
    return composite || midwife.email;
  }

  private mapMidwife(midwife: MidwifeRecord): DistrictMidwife {
    return {
      id: midwife.id,
      name: this.buildDisplayName(midwife),
      email: midwife.email,
      phone: midwife.phone ?? null,
      licenseNumber: midwife.licenseNumber ?? null,
      facilityName: midwife.facilityName ?? null,
      region: this.normalizeRegion(midwife.region),
      createdAt: midwife.createdAt.toISOString(),
      lastLoginAt: midwife.lastLoginAt ? midwife.lastLoginAt.toISOString() : null,
    };
  }

  async getDistricts(): Promise<AdminDistrictsResponse> {
    const midwives: MidwifeRecord[] = await this.prisma.midwife.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        givenName: true,
        familyName: true,
        phone: true,
        licenseNumber: true,
        facilityName: true,
        region: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: [{ region: 'asc' }, { createdAt: 'desc' }],
    });

    const regionMap = new Map<string, DistrictSummary>();
    const midwifeRegion = new Map<string, string>();

    midwives.forEach((midwife) => {
      const region = this.normalizeRegion(midwife.region) ?? UNASSIGNED_LABEL;
      midwifeRegion.set(midwife.id, region);
      const bucket = regionMap.get(region) ?? {
        name: region,
        midwives: 0,
        children: 0,
        pregnancies: 0,
      };
      bucket.midwives += 1;
      regionMap.set(region, bucket);
    });

    const [childrenByMidwife, pregnanciesByMidwife, unassignedChildren, unassignedPregnancies] =
      await Promise.all([
        this.prisma.child.groupBy({
          by: ['midwifeId'],
          _count: { _all: true },
          where: { midwifeId: { not: null } },
        }),
        this.prisma.pregnancy.groupBy({
          by: ['midwifeId'],
          _count: { _all: true },
          where: { midwifeId: { not: null } },
        }),
        this.prisma.child.count({ where: { midwifeId: null } }),
        this.prisma.pregnancy.count({ where: { midwifeId: null } }),
      ]);

    childrenByMidwife.forEach((group) => {
      const region = group.midwifeId ? midwifeRegion.get(group.midwifeId) : null;
      const name = region ?? UNASSIGNED_LABEL;
      const bucket = regionMap.get(name) ?? {
        name,
        midwives: 0,
        children: 0,
        pregnancies: 0,
      };
      bucket.children += group._count._all;
      regionMap.set(name, bucket);
    });

    pregnanciesByMidwife.forEach((group) => {
      const region = group.midwifeId ? midwifeRegion.get(group.midwifeId) : null;
      const name = region ?? UNASSIGNED_LABEL;
      const bucket = regionMap.get(name) ?? {
        name,
        midwives: 0,
        children: 0,
        pregnancies: 0,
      };
      bucket.pregnancies += group._count._all;
      regionMap.set(name, bucket);
    });

    if (unassignedChildren > 0 || unassignedPregnancies > 0) {
      const bucket = regionMap.get(UNASSIGNED_LABEL) ?? {
        name: UNASSIGNED_LABEL,
        midwives: 0,
        children: 0,
        pregnancies: 0,
      };
      bucket.children += unassignedChildren;
      bucket.pregnancies += unassignedPregnancies;
      regionMap.set(bucket.name, bucket);
    }

    const districts = Array.from(regionMap.values()).sort((a, b) => {
      const aUnassigned = a.name === UNASSIGNED_LABEL;
      const bUnassigned = b.name === UNASSIGNED_LABEL;
      if (aUnassigned !== bUnassigned) {
        return aUnassigned ? 1 : -1;
      }
      if (b.midwives !== a.midwives) {
        return b.midwives - a.midwives;
      }
      return a.name.localeCompare(b.name);
    });

    return {
      districts,
      midwives: midwives.map((midwife) => this.mapMidwife(midwife)),
    };
  }

  async updateMidwifeRegion(
    midwifeId: string,
    dto: UpdateMidwifeRegionDto
  ): Promise<DistrictMidwife> {
    const existing = await this.prisma.midwife.findUnique({
      where: { id: midwifeId },
      select: {
        id: true,
        email: true,
        name: true,
        givenName: true,
        familyName: true,
        phone: true,
        licenseNumber: true,
        facilityName: true,
        region: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Midwife not found');
    }

    const region = this.normalizeRegion(dto.region ?? null);

    const updated: MidwifeRecord = await this.prisma.midwife.update({
      where: { id: midwifeId },
      data: { region },
      select: {
        id: true,
        email: true,
        name: true,
        givenName: true,
        familyName: true,
        phone: true,
        licenseNumber: true,
        facilityName: true,
        region: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    return this.mapMidwife(updated);
  }
}
