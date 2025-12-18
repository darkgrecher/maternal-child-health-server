import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { Auth0AuthDto } from './dto/auth0-auth.dto';
export interface JwtPayload {
    sub: string;
    email: string;
    name?: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface GoogleUserInfo {
    googleId: string;
    email: string;
    name?: string;
    givenName?: string;
    familyName?: string;
    picture?: string;
}
export interface Auth0UserInfo {
    auth0Id: string;
    email: string;
    emailVerified?: boolean;
    name?: string;
    givenName?: string;
    familyName?: string;
    picture?: string;
    nickname?: string;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    private googleClient;
    private jwksClient;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    auth0Auth(dto: Auth0AuthDto): Promise<AuthTokens & {
        user: any;
    }>;
    private verifyAuth0Token;
    private findOrCreateUserFromAuth0;
    googleAuth(dto: GoogleAuthDto): Promise<AuthTokens>;
    private exchangeCodeForUserInfo;
    private getUserInfoFromAccessToken;
    private verifyGoogleToken;
    private findOrCreateUser;
    private generateTokens;
    refreshTokens(refreshToken: string): Promise<AuthTokens>;
    logout(refreshToken: string): Promise<void>;
    logoutAll(userId: string): Promise<void>;
    getUserById(userId: string): Promise<{
        id: string;
        email: string;
        name: string | null;
        givenName: string | null;
        familyName: string | null;
        picture: string | null;
        lastLoginAt: Date | null;
        createdAt: Date;
    } | null>;
    private getAccessTokenExpiresIn;
}
