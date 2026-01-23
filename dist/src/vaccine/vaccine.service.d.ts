import { PrismaService } from '../prisma/prisma.service';
import { UpdateVaccinationRecordDto } from './dto';
export declare class VaccineService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllVaccines(): Promise<{
        id: string;
        name: string;
        shortName: string;
        description: string | null;
        scheduledAgeMonths: number;
        scheduledAgeDays: number | null;
        doseNumber: number;
        totalDoses: number;
        ageGroup: string;
        diseasesPrevented: string[];
        sideEffects: string[];
        contraindications: string[];
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getVaccinesByAgeGroup(): Promise<{
        ageGroup: string;
        vaccines: {
            id: string;
            name: string;
            shortName: string;
            description: string | null;
            scheduledAgeMonths: number;
            scheduledAgeDays: number | null;
            doseNumber: number;
            totalDoses: number;
            ageGroup: string;
            diseasesPrevented: string[];
            sideEffects: string[];
            contraindications: string[];
            sortOrder: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }[]>;
    getChildVaccinationRecords(userId: string, childId: string): Promise<{
        child: {
            id: string;
            firstName: string;
            lastName: string;
            dateOfBirth: Date;
        };
        schedule: {
            id: string | null;
            vaccineId: string;
            vaccine: {
                id: string;
                name: string;
                shortName: string;
                description: string | null;
                scheduledAgeMonths: number;
                scheduledAgeDays: number | null;
                doseNumber: number;
                totalDoses: number;
                ageGroup: string;
                diseasesPrevented: string[];
                sideEffects: string[];
                contraindications: string[];
                sortOrder: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
            childId: string;
            scheduledDate: string;
            administeredDate: string | null;
            administeredBy: string | null;
            location: string | null;
            batchNumber: string | null;
            notes: string | null;
            sideEffectsOccurred: string[];
            status: import("@prisma/client").$Enums.VaccinationStatus;
        }[];
        statistics: {
            completed: number;
            total: number;
            overdue: number;
            pending: number;
            completionPercentage: number;
        };
        nextVaccine: {
            id: string | null;
            vaccineId: string;
            vaccine: {
                id: string;
                name: string;
                shortName: string;
                description: string | null;
                scheduledAgeMonths: number;
                scheduledAgeDays: number | null;
                doseNumber: number;
                totalDoses: number;
                ageGroup: string;
                diseasesPrevented: string[];
                sideEffects: string[];
                contraindications: string[];
                sortOrder: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
            childId: string;
            scheduledDate: string;
            administeredDate: string | null;
            administeredBy: string | null;
            location: string | null;
            batchNumber: string | null;
            notes: string | null;
            sideEffectsOccurred: string[];
            status: import("@prisma/client").$Enums.VaccinationStatus;
        } | undefined;
    }>;
    administerVaccine(userId: string, childId: string, vaccineId: string, dto: UpdateVaccinationRecordDto): Promise<{
        vaccine: {
            id: string;
            name: string;
            shortName: string;
            description: string | null;
            scheduledAgeMonths: number;
            scheduledAgeDays: number | null;
            doseNumber: number;
            totalDoses: number;
            ageGroup: string;
            diseasesPrevented: string[];
            sideEffects: string[];
            contraindications: string[];
            sortOrder: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        childId: string;
        vaccineId: string;
        status: import("@prisma/client").$Enums.VaccinationStatus;
        scheduledDate: Date;
        administeredDate: Date | null;
        administeredBy: string | null;
        location: string | null;
        batchNumber: string | null;
        notes: string | null;
        sideEffectsOccurred: string[];
    }>;
    updateVaccinationRecord(userId: string, recordId: string, dto: UpdateVaccinationRecordDto): Promise<{
        vaccine: {
            id: string;
            name: string;
            shortName: string;
            description: string | null;
            scheduledAgeMonths: number;
            scheduledAgeDays: number | null;
            doseNumber: number;
            totalDoses: number;
            ageGroup: string;
            diseasesPrevented: string[];
            sideEffects: string[];
            contraindications: string[];
            sortOrder: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        childId: string;
        vaccineId: string;
        status: import("@prisma/client").$Enums.VaccinationStatus;
        scheduledDate: Date;
        administeredDate: Date | null;
        administeredBy: string | null;
        location: string | null;
        batchNumber: string | null;
        notes: string | null;
        sideEffectsOccurred: string[];
    }>;
    seedVaccineSchedule(): Promise<{
        message: string;
        count: number;
    }>;
}
