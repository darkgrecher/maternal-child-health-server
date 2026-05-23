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
exports.AdminDistrictsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const UNASSIGNED_LABEL = 'Unassigned';
let AdminDistrictsService = class AdminDistrictsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    normalizeRegion(value) {
        const trimmed = value?.trim();
        return trimmed ? trimmed : null;
    }
    buildDisplayName(midwife) {
        const directName = midwife.name?.trim();
        if (directName) {
            return directName;
        }
        const givenName = midwife.givenName?.trim();
        const familyName = midwife.familyName?.trim();
        const composite = [givenName, familyName].filter(Boolean).join(' ');
        return composite || midwife.email;
    }
    mapMidwife(midwife) {
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
    async getDistricts() {
        const midwives = await this.prisma.midwife.findMany({
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
        const regionMap = new Map();
        const midwifeRegion = new Map();
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
        const [childrenByMidwife, pregnanciesByMidwife, unassignedChildren, unassignedPregnancies] = await Promise.all([
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
    async updateMidwifeRegion(midwifeId, dto) {
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
            throw new common_1.NotFoundException('Midwife not found');
        }
        const region = this.normalizeRegion(dto.region ?? null);
        const updated = await this.prisma.midwife.update({
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
};
exports.AdminDistrictsService = AdminDistrictsService;
exports.AdminDistrictsService = AdminDistrictsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminDistrictsService);
//# sourceMappingURL=admin-districts.service.js.map