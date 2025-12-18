export declare enum AppointmentType {
    vaccination = "vaccination",
    growth_check = "growth_check",
    development_check = "development_check",
    general_checkup = "general_checkup",
    specialist = "specialist",
    emergency = "emergency"
}
export declare class CreateAppointmentDto {
    title: string;
    type: AppointmentType;
    dateTime: string;
    duration?: number;
    location: string;
    address?: string;
    providerName?: string;
    providerRole?: string;
    providerPhone?: string;
    notes?: string;
}
