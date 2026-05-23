import { PrismaService } from '../prisma/prisma.service';
import { UpdateMidwifeRegionDto } from './dto';
export interface DistrictSummary {
    name: string;
    midwives: number;
    children: number;
    pregnancies: number;
}
export interface DistrictMidwife {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    licenseNumber: string | null;
    facilityName: string | null;
    region: string | null;
    createdAt: string;
    lastLoginAt: string | null;
}
export interface AdminDistrictsResponse {
    districts: DistrictSummary[];
    midwives: DistrictMidwife[];
}
export declare class AdminDistrictsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private normalizeRegion;
    private buildDisplayName;
    private mapMidwife;
    getDistricts(): Promise<AdminDistrictsResponse>;
    updateMidwifeRegion(midwifeId: string, dto: UpdateMidwifeRegionDto): Promise<DistrictMidwife>;
}
