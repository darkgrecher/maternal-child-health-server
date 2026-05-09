import { PrismaService } from '../prisma/prisma.service';
import { ClaimMidwifeLinkDto } from './dto';
export declare class MidwifeLinkService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private createCode;
    generate(midwifeId: string): Promise<{
        code: string;
        qrPayload: string;
        createdAt: string;
    }>;
    claim(userId: string, dto: ClaimMidwifeLinkDto): Promise<{
        profileType: "child" | "pregnancy";
        profileId: string;
        midwife: {
            id: string;
            name: string | null;
            phone: string | null;
            facilityName: string | null;
            region: string | null;
        };
    }>;
}
