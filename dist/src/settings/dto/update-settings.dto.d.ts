export declare class UpdateSettingsProfileDto {
    name?: string;
    email?: string;
    phone?: string;
    picture?: string;
}
export declare class UpdateSettingsNotificationsDto {
    appointments?: boolean;
    vaccinations?: boolean;
    highRisk?: boolean;
    dailyDigest?: boolean;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
}
export declare class UpdateSettingsPreferencesDto {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    dateFormat?: string;
    notifications?: UpdateSettingsNotificationsDto;
}
export declare class UpdateSettingsDto {
    profile?: UpdateSettingsProfileDto;
    preferences?: UpdateSettingsPreferencesDto;
}
