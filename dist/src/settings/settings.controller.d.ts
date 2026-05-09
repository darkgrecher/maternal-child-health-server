import { SettingsPayload, SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    private getMidwifeId;
    getSettings(req: any): Promise<{
        success: boolean;
        data: SettingsPayload;
    }>;
    updateSettings(req: any, dto: UpdateSettingsDto): Promise<{
        success: boolean;
        data: SettingsPayload;
    }>;
}
