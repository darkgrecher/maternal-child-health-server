import { MidwifeRole } from '@prisma/client';
export declare class MidwifeProvisionDto {
    email: string;
    password: string;
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
