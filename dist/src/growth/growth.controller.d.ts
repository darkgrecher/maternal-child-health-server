import { GrowthService } from './growth.service';
import { CreateGrowthMeasurementDto, UpdateGrowthMeasurementDto } from './dto';
export declare class GrowthController {
    private readonly growthService;
    constructor(growthService: GrowthService);
    getChildMeasurements(childId: string): Promise<{
        success: boolean;
        data: {
            childId: string;
            childName: string;
            dateOfBirth: Date;
            gender: import("@prisma/client").$Enums.Gender;
            birthWeight: number | null;
            birthHeight: number | null;
            birthHeadCircumference: number | null;
            measurements: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                childId: string;
                location: string | null;
                notes: string | null;
                measurementDate: Date;
                weight: number;
                height: number;
                headCircumference: number | null;
                measuredBy: string | null;
                ageInMonths: number;
                ageInDays: number | null;
                weightPercentile: number | null;
                heightPercentile: number | null;
                headCircumferencePercentile: number | null;
                weightZScore: number | null;
                heightZScore: number | null;
                headCircumferenceZScore: number | null;
                bmi: number | null;
                bmiPercentile: number | null;
                bmiZScore: number | null;
            }[];
            summary: {
                latestWeight: number;
                latestHeight: number;
                latestHeadCircumference: number | null;
                latestWeightPercentile: number | null;
                latestHeightPercentile: number | null;
                latestHeadCircumferencePercentile: number | null;
                totalMeasurements: number;
                lastMeasurementDate: Date;
            } | null;
        };
    }>;
    getChartData(childId: string, chartType?: 'weight' | 'height' | 'head'): Promise<{
        success: boolean;
        data: {
            childId: string;
            chartType: "weight" | "height" | "head";
            gender: import("@prisma/client").$Enums.Gender;
            dataPoints: {
                date: Date;
                ageInMonths: number;
                value: number | null;
                percentile: number | null;
            }[];
            referenceData: Record<string, {
                age: number;
                value: number;
            }[]>;
        };
    }>;
    addMeasurement(childId: string, dto: CreateGrowthMeasurementDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            childId: string;
            location: string | null;
            notes: string | null;
            measurementDate: Date;
            weight: number;
            height: number;
            headCircumference: number | null;
            measuredBy: string | null;
            ageInMonths: number;
            ageInDays: number | null;
            weightPercentile: number | null;
            heightPercentile: number | null;
            headCircumferencePercentile: number | null;
            weightZScore: number | null;
            heightZScore: number | null;
            headCircumferenceZScore: number | null;
            bmi: number | null;
            bmiPercentile: number | null;
            bmiZScore: number | null;
        };
    }>;
    updateMeasurement(measurementId: string, dto: UpdateGrowthMeasurementDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            childId: string;
            location: string | null;
            notes: string | null;
            measurementDate: Date;
            weight: number;
            height: number;
            headCircumference: number | null;
            measuredBy: string | null;
            ageInMonths: number;
            ageInDays: number | null;
            weightPercentile: number | null;
            heightPercentile: number | null;
            headCircumferencePercentile: number | null;
            weightZScore: number | null;
            heightZScore: number | null;
            headCircumferenceZScore: number | null;
            bmi: number | null;
            bmiPercentile: number | null;
            bmiZScore: number | null;
        };
    }>;
    deleteMeasurement(measurementId: string): Promise<{
        success: boolean;
        data: {
            message: string;
        };
    }>;
}
