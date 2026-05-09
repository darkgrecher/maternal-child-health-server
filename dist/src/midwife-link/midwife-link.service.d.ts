import { PrismaService } from '../prisma/prisma.service';
import { ClaimMidwifeLinkDto } from './dto';
import { MidwifeLinkProfileType } from '@prisma/client';
export declare class MidwifeLinkService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private createCode;
    generate(midwifeId: string, profileType: MidwifeLinkProfileType): Promise<{
        code: string;
        profileType: import("@prisma/client").$Enums.MidwifeLinkProfileType;
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
    listNotifications(midwifeId: string, limit?: number): Promise<{
        id: string;
        type: "mismatch";
        expectedProfileType: import("@prisma/client").$Enums.MidwifeLinkProfileType;
        scannedProfileType: import("@prisma/client").$Enums.MidwifeLinkProfileType;
        message: string;
        createdAt: string;
        isRead: boolean;
    }[]>;
}
