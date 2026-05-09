import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto';
export interface SettingsProfile {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    role: string;
    licenseNumber: string | null;
    facilityName: string | null;
    region: string | null;
    picture: string | null;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string | null;
}
export interface SettingsPreferences {
    theme: 'light' | 'dark' | 'system';
    language: string;
    dateFormat: string;
    notifications: {
        appointments: boolean;
        vaccinations: boolean;
        highRisk: boolean;
        dailyDigest: boolean;
        emailNotifications: boolean;
        smsNotifications: boolean;
    };
}
export interface SettingsStats {
    patientsManaged: number;
    appointmentsThisMonth: number;
    vaccinationsAdministered: number;
}
export interface SettingsPayload {
    profile: SettingsProfile;
    preferences: SettingsPreferences;
    stats: SettingsStats;
}
export declare class SettingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSettings(midwifeId: string): Promise<SettingsPayload>;
    updateSettings(midwifeId: string, dto: UpdateSettingsDto): Promise<SettingsPayload>;
    private mapProfile;
    private mapPreferences;
    private getStats;
}
