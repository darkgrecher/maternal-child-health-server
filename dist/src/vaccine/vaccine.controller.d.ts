import { VaccineService } from './vaccine.service';
import { UpdateVaccinationRecordDto } from './dto';
export declare class VaccineController {
    private readonly vaccineService;
    constructor(vaccineService: VaccineService);
    getAllVaccines(): Promise<{
        success: boolean;
        data: {
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
    }>;
    getVaccinesByAgeGroup(): Promise<{
        success: boolean;
        data: {
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
        }[];
    }>;
    getChildVaccinationRecords(req: any, childId: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    administerVaccine(req: any, childId: string, vaccineId: string, dto: UpdateVaccinationRecordDto): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    updateVaccinationRecord(req: any, recordId: string, dto: UpdateVaccinationRecordDto): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    seedVaccineSchedule(): Promise<{
        success: boolean;
        data: {
            message: string;
            count: number;
        };
    }>;
}
