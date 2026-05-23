import { AdminDistrictsService } from './admin-districts.service';
import { UpdateMidwifeRegionDto } from './dto';
export declare class AdminDistrictsController {
    private readonly adminDistrictsService;
    constructor(adminDistrictsService: AdminDistrictsService);
    private assertAdminAccess;
    getDistricts(req: any): Promise<{
        success: boolean;
        data: import("./admin-districts.service").AdminDistrictsResponse;
    }>;
    updateMidwifeRegion(req: any, midwifeId: string, dto: UpdateMidwifeRegionDto): Promise<{
        success: boolean;
        data: import("./admin-districts.service").DistrictMidwife;
    }>;
}
