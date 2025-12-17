import { AuthService } from './auth.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    googleAuth(dto: GoogleAuthDto): Promise<{
        success: boolean;
        data: import("./auth.service").AuthTokens;
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
