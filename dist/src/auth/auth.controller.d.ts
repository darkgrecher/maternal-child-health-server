import { AuthService } from './auth.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Auth0AuthDto } from './dto/auth0-auth.dto';
import { MidwifeLoginDto } from './dto/midwife-login.dto';
import { MidwifeProvisionDto } from './dto/midwife-provision.dto';
import { MidwifeUpdateDto } from './dto/midwife-update.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    auth0Auth(dto: Auth0AuthDto): Promise<{
        success: boolean;
        data: import("./auth.service").AuthTokens & {
            user: any;
            actorType: import("./auth.service").ActorType;
        };
    }>;
    googleAuth(dto: GoogleAuthDto): Promise<{
        success: boolean;
        data: import("./auth.service").AuthTokens;
    }>;
    midwifeLogin(dto: MidwifeLoginDto): Promise<{
        success: boolean;
        data: import("./auth.service").AuthTokens & {
            user: any;
            actorType: import("./auth.service").ActorType;
        };
    }>;
    changePassword(req: any, dto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    provisionMidwife(req: any, dto: MidwifeProvisionDto): Promise<{
        success: boolean;
        data: {
            id: string;
            email: string;
            name: string | null;
            givenName: string | null;
            familyName: string | null;
            picture: string | null;
            role: import("@prisma/client").$Enums.MidwifeRole;
            phone: string | null;
            licenseNumber: string | null;
            facilityName: string | null;
            region: string | null;
            createdAt: Date;
            updatedAt: Date;
            lastLoginAt: Date | null;
        };
    }>;
    listMidwives(req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            email: string;
            name: string | null;
            givenName: string | null;
            familyName: string | null;
            picture: string | null;
            lastLoginAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            role: import("@prisma/client").$Enums.MidwifeRole;
            phone: string | null;
            licenseNumber: string | null;
            facilityName: string | null;
            region: string | null;
        }[];
    }>;
    updateMidwife(req: any, midwifeId: string, dto: MidwifeUpdateDto): Promise<{
        success: boolean;
        data: {
            id: string;
            email: string;
            name: string | null;
            givenName: string | null;
            familyName: string | null;
            picture: string | null;
            role: import("@prisma/client").$Enums.MidwifeRole;
            phone: string | null;
            licenseNumber: string | null;
            facilityName: string | null;
            region: string | null;
            createdAt: Date;
            updatedAt: Date;
            lastLoginAt: Date | null;
        };
    }>;
    deleteMidwife(req: any, midwifeId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            email: string;
        };
    }>;
    refreshToken(dto: RefreshTokenDto): Promise<{
        success: boolean;
        data: import("./auth.service").AuthTokens;
    }>;
    getProfile(req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            email: string;
            name: string | null;
            givenName: string | null;
            familyName: string | null;
            picture: string | null;
            lastLoginAt: Date | null;
            createdAt: Date;
        } | null;
    }>;
    logout(dto: RefreshTokenDto): Promise<{
        success: boolean;
        message: string;
    }>;
    logoutAll(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
