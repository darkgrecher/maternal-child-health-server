export declare enum VaccinationStatusDto {
    pending = "pending",
    completed = "completed",
    overdue = "overdue",
    missed = "missed",
    scheduled = "scheduled"
}
export declare class CreateVaccinationRecordDto {
    childId: string;
    vaccineId: string;
    scheduledDate: string;
    status?: VaccinationStatusDto;
    administeredDate?: string;
    administeredBy?: string;
    location?: string;
    batchNumber?: string;
    notes?: string;
    sideEffectsOccurred?: string[];
}
