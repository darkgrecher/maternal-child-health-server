import { Prisma } from '@prisma/client';
export declare class CreateTestWebPushDto {
    title: string;
    message: string;
    data?: Prisma.InputJsonObject;
}
