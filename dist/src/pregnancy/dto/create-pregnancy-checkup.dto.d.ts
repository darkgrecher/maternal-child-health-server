export declare class CreatePregnancyCheckupDto {
    checkupDate: string;
    weekOfPregnancy: number;
    weight?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    fundalHeight?: number;
    fetalHeartRate?: number;
    fetalWeight?: number;
    fetalLength?: number;
    amnioticFluid?: string;
    placentaPosition?: string;
    urineProtein?: string;
    urineGlucose?: string;
    hemoglobin?: number;
    notes?: string;
    recommendations?: string[];
    nextCheckupDate?: string;
    providerName?: string;
    location?: string;
}
