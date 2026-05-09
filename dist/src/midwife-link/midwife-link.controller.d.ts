import { MidwifeLinkService } from './midwife-link.service';
import { ClaimMidwifeLinkDto } from './dto';
export declare class MidwifeLinkController {
    private readonly midwifeLinkService;
    constructor(midwifeLinkService: MidwifeLinkService);
    generateQr(req: any): Promise<{
        success: boolean;
        data: {
            code: string;
            qrPayload: string;
            createdAt: string;
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
