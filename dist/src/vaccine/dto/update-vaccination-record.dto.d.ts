import { VaccinationStatusDto } from './create-vaccination-record.dto';
export declare class UpdateVaccinationRecordDto {
    status?: VaccinationStatusDto;
    scheduledDate?: string;
    administeredDate?: string;
    administeredBy?: string;
    location?: string;
    batchNumber?: string;
    notes?: string;
    sideEffectsOccurred?: string[];
}
