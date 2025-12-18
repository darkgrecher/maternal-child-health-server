import { AppointmentType } from './create-appointment.dto';
export declare enum AppointmentStatus {
    scheduled = "scheduled",
    completed = "completed",
    cancelled = "cancelled",
    rescheduled = "rescheduled",
    missed = "missed"
}
export declare class UpdateAppointmentDto {
    title?: string;
    type?: AppointmentType;
    dateTime?: string;
    duration?: number;
    location?: string;
    address?: string;
    providerName?: string;
    providerRole?: string;
    providerPhone?: string;
    status?: AppointmentStatus;
    notes?: string;
    reminderSent?: boolean;
}
