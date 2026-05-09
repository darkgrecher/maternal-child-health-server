import { MidwifeLinkService } from './midwife-link.service';
import { ClaimMidwifeLinkDto, GenerateMidwifeLinkDto } from './dto';
export declare class MidwifeLinkController {
    private readonly midwifeLinkService;
    constructor(midwifeLinkService: MidwifeLinkService);
    generateQr(req: any, dto: GenerateMidwifeLinkDto): Promise<{
        success: boolean;
        data: {
            code: string;
            profileType: import("@prisma/client").$Enums.MidwifeLinkProfileType;
            qrPayload: string;
            createdAt: string;
        };
    }>;
    listNotifications(req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            type: "mismatch";
            expectedProfileType: import("@prisma/client").$Enums.MidwifeLinkProfileType;
            scannedProfileType: import("@prisma/client").$Enums.MidwifeLinkProfileType;
            message: string;
            createdAt: string;
            isRead: boolean;
        }[];
    }>;
    getStatus(req: any, code: string): Promise<{
        success: boolean;
        data: {
            code: string;
            profileType: import("@prisma/client").$Enums.MidwifeLinkProfileType;
            isActive: boolean;
            lastUsedAt: string | null;
        };
    }>;
    claim(req: any, dto: ClaimMidwifeLinkDto): Promise<{
        success: boolean;
        data: {
            profileType: "child" | "pregnancy";
            profileId: string;
            midwife: {
                id: string;
                name: string | null;
                phone: string | null;
                facilityName: string | null;
                region: string | null;
            };
        };
    }>;
}
