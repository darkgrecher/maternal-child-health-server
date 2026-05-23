import { Prisma } from '@prisma/client';
export declare class CreateTestPushDto {
    title: string;
    message: string;
    data?: Prisma.InputJsonObject;
}
