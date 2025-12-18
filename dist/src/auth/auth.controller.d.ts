import { AuthService } from './auth.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Auth0AuthDto } from './dto/auth0-auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    auth0Auth(dto: Auth0AuthDto): Promise<{
        success: boolean;
        data: import("./auth.service").AuthTokens & {
            user: any;
        };
    }>;
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
