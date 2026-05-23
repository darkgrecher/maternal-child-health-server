import { MidwifeRole } from '@prisma/client';
export declare class MidwifeUpdateDto {
    email?: string;
    name?: string;
    givenName?: string;
    familyName?: string;
    picture?: string;
    role?: MidwifeRole;
    phone?: string;
    licenseNumber?: string;
    facilityName?: string;
    region?: string;
}
