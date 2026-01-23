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
exports.VaccineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let VaccineService = class VaccineService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllVaccines() {
        return this.prisma.vaccine.findMany({
            where: { isActive: true },
            orderBy: [
                { sortOrder: 'asc' },
                { scheduledAgeMonths: 'asc' },
                { doseNumber: 'asc' },
            ],
        });
    }
    async getVaccinesByAgeGroup() {
        const vaccines = await this.getAllVaccines();
        const groups = {};
        for (const vaccine of vaccines) {
            if (!groups[vaccine.ageGroup]) {
                groups[vaccine.ageGroup] = [];
            }
            groups[vaccine.ageGroup].push(vaccine);
        }
        return Object.entries(groups).map(([ageGroup, vaccines]) => ({
            ageGroup,
            vaccines,
        }));
    }
    async getChildVaccinationRecords(userId, childId) {
        const child = await this.prisma.child.findFirst({
            where: { id: childId, userId },
        });
        if (!child) {
            throw new common_1.NotFoundException('Child not found');
        }
        const vaccines = await this.getAllVaccines();
        const records = await this.prisma.vaccinationRecord.findMany({
            where: { childId },
            include: { vaccine: true },
        });
        const recordMap = new Map(records.map(r => [r.vaccineId, r]));
        const childDob = new Date(child.dateOfBirth);
        const today = new Date();
        const schedule = vaccines.map(vaccine => {
            const existingRecord = recordMap.get(vaccine.id);
            const scheduledDate = new Date(childDob);
            scheduledDate.setMonth(scheduledDate.getMonth() + vaccine.scheduledAgeMonths);
            if (vaccine.scheduledAgeDays) {
                scheduledDate.setDate(scheduledDate.getDate() + vaccine.scheduledAgeDays);
            }
            let status = 'pending';
            if (existingRecord) {
                status = existingRecord.status;
            }
            else if (scheduledDate < today) {
                const daysDiff = Math.floor((today.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24));
                status = daysDiff > 30 ? 'overdue' : 'pending';
            }
            else {
                status = 'scheduled';
            }
            return {
                id: existingRecord?.id || null,
                vaccineId: vaccine.id,
                vaccine,
                childId,
                scheduledDate: scheduledDate.toISOString(),
                administeredDate: existingRecord?.administeredDate?.toISOString() || null,
                administeredBy: existingRecord?.administeredBy || null,
                location: existingRecord?.location || null,
                batchNumber: existingRecord?.batchNumber || null,
                notes: existingRecord?.notes || null,
                sideEffectsOccurred: existingRecord?.sideEffectsOccurred || [],
                status,
            };
        });
        const completed = schedule.filter(s => s.status === 'completed').length;
        const total = schedule.length;
        const overdue = schedule.filter(s => s.status === 'overdue').length;
        const pending = schedule.filter(s => s.status === 'pending').length;
        const nextVaccine = schedule.find(s => s.status === 'pending' || s.status === 'scheduled' || s.status === 'overdue');
        return {
            child: {
                id: child.id,
                firstName: child.firstName,
                lastName: child.lastName,
                dateOfBirth: child.dateOfBirth,
            },
            schedule,
            statistics: {
                completed,
                total,
                overdue,
                pending,
                completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
            },
            nextVaccine,
        };
    }
    async administerVaccine(userId, childId, vaccineId, dto) {
        const child = await this.prisma.child.findFirst({
            where: { id: childId, userId },
        });
        if (!child) {
            throw new common_1.NotFoundException('Child not found');
        }
        const vaccine = await this.prisma.vaccine.findUnique({
            where: { id: vaccineId },
        });
        if (!vaccine) {
            throw new common_1.NotFoundException('Vaccine not found');
        }
        const childDob = new Date(child.dateOfBirth);
        const scheduledDate = new Date(childDob);
        scheduledDate.setMonth(scheduledDate.getMonth() + vaccine.scheduledAgeMonths);
        if (vaccine.scheduledAgeDays) {
            scheduledDate.setDate(scheduledDate.getDate() + vaccine.scheduledAgeDays);
        }
        const record = await this.prisma.vaccinationRecord.upsert({
            where: {
                childId_vaccineId: { childId, vaccineId },
            },
            create: {
                childId,
                vaccineId,
                scheduledDate,
                status: 'completed',
                administeredDate: dto.administeredDate ? new Date(dto.administeredDate) : new Date(),
                administeredBy: dto.administeredBy,
                location: dto.location,
                batchNumber: dto.batchNumber,
                notes: dto.notes,
                sideEffectsOccurred: dto.sideEffectsOccurred || [],
            },
            update: {
                status: dto.status || 'completed',
                administeredDate: dto.administeredDate ? new Date(dto.administeredDate) : new Date(),
                administeredBy: dto.administeredBy,
                location: dto.location,
                batchNumber: dto.batchNumber,
                notes: dto.notes,
                sideEffectsOccurred: dto.sideEffectsOccurred || [],
            },
            include: { vaccine: true },
        });
        await this.prisma.activity.create({
            data: {
                childId,
                type: 'vaccination',
                title: `Vaccination: ${record.vaccine.shortName}`,
                description: `Administered ${record.vaccine.fullName}${dto.location ? ` at ${dto.location}` : ''}${dto.notes ? ` | Notes: ${dto.notes}` : ''}`,
                date: record.administeredDate || new Date(),
                icon: 'vaccination',
            },
        });
        return record;
    }
    async updateVaccinationRecord(userId, recordId, dto) {
        const record = await this.prisma.vaccinationRecord.findUnique({
            where: { id: recordId },
            include: { child: true },
        });
        if (!record) {
            throw new common_1.NotFoundException('Vaccination record not found');
        }
        if (record.child.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.prisma.vaccinationRecord.update({
            where: { id: recordId },
            data: {
                status: dto.status,
                scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
                administeredDate: dto.administeredDate ? new Date(dto.administeredDate) : undefined,
                administeredBy: dto.administeredBy,
                location: dto.location,
                batchNumber: dto.batchNumber,
                notes: dto.notes,
                sideEffectsOccurred: dto.sideEffectsOccurred,
            },
            include: { vaccine: true },
        });
    }
    async seedVaccineSchedule() {
        const vaccines = [
            {
                name: 'Bacillus Calmette-Guérin',
                shortName: 'BCG',
                description: 'Vaccine against tuberculosis',
                scheduledAgeMonths: 0,
                scheduledAgeDays: 0,
                doseNumber: 1,
                totalDoses: 1,
                ageGroup: 'At Birth',
                diseasesPrevented: ['Tuberculosis'],
                sideEffects: ['Local swelling', 'Mild fever'],
                contraindications: ['Immunodeficiency', 'HIV positive with symptoms'],
                sortOrder: 1,
            },
            {
                name: 'Oral Polio Vaccine (Birth Dose)',
                shortName: 'OPV',
                description: 'Oral vaccine against poliomyelitis - Birth dose',
                scheduledAgeMonths: 0,
                scheduledAgeDays: 0,
                doseNumber: 0,
                totalDoses: 5,
                ageGroup: 'At Birth',
                diseasesPrevented: ['Poliomyelitis'],
                sideEffects: ['Rare mild fever'],
                contraindications: ['Severe immunodeficiency'],
                sortOrder: 2,
            },
            {
                name: 'Pentavalent Vaccine (DPT-HepB-Hib)',
                shortName: 'Pentavalent',
                description: 'Combined vaccine against Diphtheria, Pertussis, Tetanus, Hepatitis B, and Haemophilus influenzae type b',
                scheduledAgeMonths: 2,
                scheduledAgeDays: 0,
                doseNumber: 1,
                totalDoses: 3,
                ageGroup: '2 Months',
                diseasesPrevented: ['Diphtheria', 'Pertussis', 'Tetanus', 'Hepatitis B', 'Haemophilus influenzae type b'],
                sideEffects: ['Fever', 'Injection site pain', 'Irritability'],
                contraindications: ['Severe allergic reaction to previous dose'],
                sortOrder: 3,
            },
            {
                name: 'Oral Polio Vaccine',
                shortName: 'OPV',
                description: 'Oral vaccine against poliomyelitis - First dose',
                scheduledAgeMonths: 2,
                scheduledAgeDays: 0,
                doseNumber: 1,
                totalDoses: 5,
                ageGroup: '2 Months',
                diseasesPrevented: ['Poliomyelitis'],
                sideEffects: ['Rare mild fever'],
                contraindications: ['Severe immunodeficiency'],
                sortOrder: 4,
            },
            {
                name: 'Fractional Inactivated Polio Vaccine',
                shortName: 'fIPV',
                description: 'Injectable inactivated polio vaccine - First dose',
                scheduledAgeMonths: 2,
                scheduledAgeDays: 0,
                doseNumber: 1,
                totalDoses: 2,
                ageGroup: '2 Months',
                diseasesPrevented: ['Poliomyelitis'],
                sideEffects: ['Injection site reactions'],
                contraindications: ['Severe allergic reaction to previous dose'],
                sortOrder: 5,
            },
            {
                name: 'Pentavalent Vaccine (DPT-HepB-Hib)',
                shortName: 'Pentavalent',
                description: 'Combined vaccine - Second dose',
                scheduledAgeMonths: 4,
                scheduledAgeDays: 0,
                doseNumber: 2,
                totalDoses: 3,
                ageGroup: '4 Months',
                diseasesPrevented: ['Diphtheria', 'Pertussis', 'Tetanus', 'Hepatitis B', 'Haemophilus influenzae type b'],
                sideEffects: ['Fever', 'Injection site pain', 'Irritability'],
                contraindications: ['Severe allergic reaction to previous dose'],
                sortOrder: 6,
            },
            {
                name: 'Oral Polio Vaccine',
                shortName: 'OPV',
                description: 'Oral vaccine against poliomyelitis - Second dose',
                scheduledAgeMonths: 4,
                scheduledAgeDays: 0,
                doseNumber: 2,
                totalDoses: 5,
                ageGroup: '4 Months',
                diseasesPrevented: ['Poliomyelitis'],
                sideEffects: ['Rare mild fever'],
                contraindications: ['Severe immunodeficiency'],
                sortOrder: 7,
            },
            {
                name: 'Fractional Inactivated Polio Vaccine',
                shortName: 'fIPV',
                description: 'Injectable inactivated polio vaccine - Second dose',
                scheduledAgeMonths: 4,
                scheduledAgeDays: 0,
                doseNumber: 2,
                totalDoses: 2,
                ageGroup: '4 Months',
                diseasesPrevented: ['Poliomyelitis'],
                sideEffects: ['Injection site reactions'],
                contraindications: ['Severe allergic reaction to previous dose'],
                sortOrder: 8,
            },
            {
                name: 'Pentavalent Vaccine (DPT-HepB-Hib)',
                shortName: 'Pentavalent',
                description: 'Combined vaccine - Third dose',
                scheduledAgeMonths: 6,
                scheduledAgeDays: 0,
                doseNumber: 3,
                totalDoses: 3,
                ageGroup: '6 Months',
                diseasesPrevented: ['Diphtheria', 'Pertussis', 'Tetanus', 'Hepatitis B', 'Haemophilus influenzae type b'],
                sideEffects: ['Fever', 'Injection site pain', 'Irritability'],
                contraindications: ['Severe allergic reaction to previous dose'],
                sortOrder: 9,
            },
            {
                name: 'Oral Polio Vaccine',
                shortName: 'OPV',
                description: 'Oral vaccine against poliomyelitis - Third dose',
                scheduledAgeMonths: 6,
                scheduledAgeDays: 0,
                doseNumber: 3,
                totalDoses: 5,
                ageGroup: '6 Months',
                diseasesPrevented: ['Poliomyelitis'],
                sideEffects: ['Rare mild fever'],
                contraindications: ['Severe immunodeficiency'],
                sortOrder: 10,
            },
            {
                name: 'Measles, Mumps, Rubella Vaccine',
                shortName: 'MMR',
                description: 'Combined vaccine against Measles, Mumps, and Rubella - First dose',
                scheduledAgeMonths: 9,
                scheduledAgeDays: 0,
                doseNumber: 1,
                totalDoses: 2,
                ageGroup: '9 Months',
                diseasesPrevented: ['Measles', 'Mumps', 'Rubella'],
                sideEffects: ['Mild fever', 'Rash', 'Joint pain'],
                contraindications: ['Pregnancy', 'Severe immunodeficiency', 'Allergy to vaccine components'],
                sortOrder: 11,
            },
            {
                name: 'Japanese Encephalitis Vaccine (Live)',
                shortName: 'Live JE',
                description: 'Live attenuated vaccine against Japanese Encephalitis',
                scheduledAgeMonths: 12,
                scheduledAgeDays: 0,
                doseNumber: 1,
                totalDoses: 1,
                ageGroup: '12 Months',
                diseasesPrevented: ['Japanese Encephalitis'],
                sideEffects: ['Mild fever', 'Injection site reactions'],
                contraindications: ['Severe immunodeficiency', 'Pregnancy'],
                sortOrder: 12,
            },
            {
                name: 'DPT Booster',
                shortName: 'DPT',
                description: 'Diphtheria, Pertussis, Tetanus booster dose',
                scheduledAgeMonths: 18,
                scheduledAgeDays: 0,
                doseNumber: 4,
                totalDoses: 4,
                ageGroup: '18 Months',
                diseasesPrevented: ['Diphtheria', 'Pertussis', 'Tetanus'],
                sideEffects: ['Fever', 'Injection site pain', 'Irritability'],
                contraindications: ['Severe allergic reaction to previous dose'],
                sortOrder: 13,
            },
            {
                name: 'Oral Polio Vaccine (Booster)',
                shortName: 'OPV',
                description: 'Oral vaccine against poliomyelitis - Booster dose',
                scheduledAgeMonths: 18,
                scheduledAgeDays: 0,
                doseNumber: 4,
                totalDoses: 5,
                ageGroup: '18 Months',
                diseasesPrevented: ['Poliomyelitis'],
                sideEffects: ['Rare mild fever'],
                contraindications: ['Severe immunodeficiency'],
                sortOrder: 14,
            },
            {
                name: 'Measles, Mumps, Rubella Vaccine',
                shortName: 'MMR',
                description: 'Combined vaccine - Second dose',
                scheduledAgeMonths: 36,
                scheduledAgeDays: 0,
                doseNumber: 2,
                totalDoses: 2,
                ageGroup: '3 Years',
                diseasesPrevented: ['Measles', 'Mumps', 'Rubella'],
                sideEffects: ['Mild fever', 'Rash', 'Joint pain'],
                contraindications: ['Pregnancy', 'Severe immunodeficiency', 'Allergy to vaccine components'],
                sortOrder: 15,
            },
            {
                name: 'Diphtheria-Tetanus Vaccine',
                shortName: 'DT',
                description: 'Diphtheria and Tetanus vaccine for school entry',
                scheduledAgeMonths: 60,
                scheduledAgeDays: 0,
                doseNumber: 1,
                totalDoses: 1,
                ageGroup: '5 Years',
                diseasesPrevented: ['Diphtheria', 'Tetanus'],
                sideEffects: ['Injection site pain', 'Mild fever'],
                contraindications: ['Severe allergic reaction to previous dose'],
                sortOrder: 16,
            },
            {
                name: 'Oral Polio Vaccine (School Entry)',
                shortName: 'OPV',
                description: 'Oral vaccine against poliomyelitis - School entry booster',
                scheduledAgeMonths: 60,
                scheduledAgeDays: 0,
                doseNumber: 5,
                totalDoses: 5,
                ageGroup: '5 Years',
                diseasesPrevented: ['Poliomyelitis'],
                sideEffects: ['Rare mild fever'],
                contraindications: ['Severe immunodeficiency'],
                sortOrder: 17,
            },
            {
                name: 'Adult Tetanus-Diphtheria Vaccine',
                shortName: 'aTd',
                description: 'Tetanus-Diphtheria booster for adolescents',
                scheduledAgeMonths: 132,
                scheduledAgeDays: 0,
                doseNumber: 1,
                totalDoses: 1,
                ageGroup: '11 Years',
                diseasesPrevented: ['Tetanus', 'Diphtheria'],
                sideEffects: ['Injection site pain', 'Mild fever'],
                contraindications: ['Severe allergic reaction to previous dose'],
                sortOrder: 18,
            },
        ];
        for (const vaccine of vaccines) {
            await this.prisma.vaccine.upsert({
                where: {
                    shortName_doseNumber: {
                        shortName: vaccine.shortName,
                        doseNumber: vaccine.doseNumber,
                    },
                },
                create: vaccine,
                update: vaccine,
            });
        }
        return { message: 'Vaccine schedule seeded successfully', count: vaccines.length };
    }
};
exports.VaccineService = VaccineService;
exports.VaccineService = VaccineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VaccineService);
//# sourceMappingURL=vaccine.service.js.map