"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const google_auth_library_1 = require("google-auth-library");
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const prisma_service_1 = require("../prisma/prisma.service");
const uuid_1 = require("uuid");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    configService;
    logger = new common_1.Logger(AuthService_1.name);
    googleClient;
    jwksClient = null;
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.googleClient = new google_auth_library_1.OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));
        const auth0Domain = this.configService.get('AUTH0_DOMAIN');
        if (auth0Domain) {
            this.jwksClient = (0, jwks_rsa_1.default)({
                jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
            });
        }
    }
    async auth0Auth(dto) {
        const auth0User = await this.verifyAuth0Token(dto.auth0Token);
        const user = await this.findOrCreateUserFromAuth0(auth0User);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.name);
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                givenName: user.givenName,
                familyName: user.familyName,
                picture: user.picture,
                auth0Id: user.auth0Id,
            },
        };
    }
    async verifyAuth0Token(token) {
        const auth0Domain = this.configService.get('AUTH0_DOMAIN');
        if (!auth0Domain) {
            throw new common_1.UnauthorizedException('Auth0 not configured');
        }
        try {
            const userInfoResponse = await fetch(`https://${auth0Domain}/userinfo`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!userInfoResponse.ok) {
                this.logger.error('Auth0 userinfo request failed:', await userInfoResponse.text());
                throw new common_1.UnauthorizedException('Invalid Auth0 token');
            }
            const userInfo = await userInfoResponse.json();
            if (!userInfo.sub || !userInfo.email) {
                throw new common_1.UnauthorizedException('Invalid Auth0 token payload');
            }
            return {
                auth0Id: userInfo.sub,
                email: userInfo.email,
                emailVerified: userInfo.email_verified,
                name: userInfo.name,
                givenName: userInfo.given_name,
                familyName: userInfo.family_name,
                picture: userInfo.picture,
                nickname: userInfo.nickname,
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            this.logger.error('Auth0 token verification failed', error);
            throw new common_1.UnauthorizedException('Failed to verify Auth0 token');
        }
    }
    async findOrCreateUserFromAuth0(auth0User) {
        let user = await this.prisma.user.findFirst({
            where: { auth0Id: auth0User.auth0Id },
        });
        if (!user) {
            const existingEmail = await this.prisma.user.findUnique({
                where: { email: auth0User.email },
            });
            if (existingEmail) {
                user = await this.prisma.user.update({
                    where: { email: auth0User.email },
                    data: {
                        auth0Id: auth0User.auth0Id,
                        name: auth0User.name || existingEmail.name,
                        givenName: auth0User.givenName || existingEmail.givenName,
                        familyName: auth0User.familyName || existingEmail.familyName,
                        picture: auth0User.picture || existingEmail.picture,
                    },
                });
                this.logger.log(`Linked Auth0 account to existing user: ${user.email}`);
            }
            else {
                user = await this.prisma.user.create({
                    data: {
                        auth0Id: auth0User.auth0Id,
                        googleId: `auth0_${auth0User.auth0Id}`,
                        email: auth0User.email,
                        name: auth0User.name,
                        givenName: auth0User.givenName,
                        familyName: auth0User.familyName,
                        picture: auth0User.picture,
                    },
                });
                this.logger.log(`New user created from Auth0: ${user.email}`);
            }
        }
        else {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    name: auth0User.name,
                    givenName: auth0User.givenName,
                    familyName: auth0User.familyName,
                    picture: auth0User.picture,
                },
            });
        }
        return user;
    }
    async googleAuth(dto) {
        let googleUser;
        if (dto.code) {
            this.logger.log('Exchanging authorization code for tokens...');
            googleUser = await this.exchangeCodeForUserInfo(dto.code, dto.redirectUri);
        }
        else if (dto.idToken) {
            this.logger.log('Verifying ID token...');
            googleUser = await this.verifyGoogleToken(dto.idToken);
        }
        else {
            throw new common_1.UnauthorizedException('Either idToken or code is required');
        }
        const user = await this.findOrCreateUser(googleUser);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        return this.generateTokens(user.id, user.email, user.name);
    }
    async exchangeCodeForUserInfo(code, redirectUri) {
        try {
            const clientId = this.configService.get('GOOGLE_CLIENT_ID');
            const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
            if (!clientId || !clientSecret) {
                throw new Error('Google OAuth credentials not configured');
            }
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    code,
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: redirectUri || '',
                    grant_type: 'authorization_code',
                }).toString(),
            });
            if (!tokenResponse.ok) {
                const error = await tokenResponse.text();
                this.logger.error('Token exchange failed:', error);
                throw new common_1.UnauthorizedException('Failed to exchange authorization code');
            }
            const tokens = await tokenResponse.json();
            this.logger.log('Token exchange successful');
            if (tokens.id_token) {
                return this.verifyGoogleToken(tokens.id_token);
            }
            if (tokens.access_token) {
                return this.getUserInfoFromAccessToken(tokens.access_token);
            }
            throw new common_1.UnauthorizedException('No token received from Google');
        }
        catch (error) {
            this.logger.error('Code exchange failed', error);
            throw new common_1.UnauthorizedException('Failed to authenticate with Google');
        }
    }
    async getUserInfoFromAccessToken(accessToken) {
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
        if (!response.ok) {
            throw new common_1.UnauthorizedException('Failed to fetch user info');
        }
        const userInfo = await response.json();
        if (!userInfo.sub || !userInfo.email) {
            throw new common_1.UnauthorizedException('Invalid user info from Google');
        }
        return {
            googleId: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            givenName: userInfo.given_name,
            familyName: userInfo.family_name,
            picture: userInfo.picture,
        };
    }
    async verifyGoogleToken(token) {
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken: token,
                audience: this.configService.get('GOOGLE_CLIENT_ID'),
            });
            const payload = ticket.getPayload();
            if (payload && payload.sub && payload.email) {
                return {
                    googleId: payload.sub,
                    email: payload.email,
                    name: payload.name,
                    givenName: payload.given_name,
                    familyName: payload.family_name,
                    picture: payload.picture,
                };
            }
        }
        catch {
            this.logger.debug('ID token verification failed, trying access token');
        }
        try {
            const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user info');
            }
            const userInfo = await response.json();
            if (!userInfo.sub || !userInfo.email) {
                throw new common_1.UnauthorizedException('Invalid Google token payload');
            }
            return {
                googleId: userInfo.sub,
                email: userInfo.email,
                name: userInfo.name,
                givenName: userInfo.given_name,
                familyName: userInfo.family_name,
                picture: userInfo.picture,
            };
        }
        catch (error) {
            this.logger.error('Google token verification failed', error);
            throw new common_1.UnauthorizedException('Invalid Google token');
        }
    }
    async findOrCreateUser(googleUser) {
        let user = await this.prisma.user.findUnique({
            where: { googleId: googleUser.googleId },
        });
        if (!user) {
            const existingEmail = await this.prisma.user.findUnique({
                where: { email: googleUser.email },
            });
            if (existingEmail) {
                user = await this.prisma.user.update({
                    where: { email: googleUser.email },
                    data: { googleId: googleUser.googleId },
                });
            }
            else {
                user = await this.prisma.user.create({
                    data: {
                        googleId: googleUser.googleId,
                        email: googleUser.email,
                        name: googleUser.name,
                        givenName: googleUser.givenName,
                        familyName: googleUser.familyName,
                        picture: googleUser.picture,
                    },
                });
                this.logger.log(`New user created: ${user.email}`);
            }
        }
        else {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    name: googleUser.name,
                    givenName: googleUser.givenName,
                    familyName: googleUser.familyName,
                    picture: googleUser.picture,
                },
            });
        }
        return user;
    }
    async generateTokens(userId, email, name) {
        const payload = {
            sub: userId,
            email,
            name: name ?? undefined,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = (0, uuid_1.v4)();
        const refreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_DAYS', 7);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + refreshExpiresIn);
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId,
                expiresAt,
            },
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: this.getAccessTokenExpiresIn(),
        };
    }
    async refreshTokens(refreshToken) {
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!storedToken) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (storedToken.expiresAt < new Date()) {
            await this.prisma.refreshToken.deleteMany({
                where: { id: storedToken.id },
            });
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        await this.prisma.refreshToken.deleteMany({
            where: { id: storedToken.id },
        });
        return this.generateTokens(storedToken.user.id, storedToken.user.email, storedToken.user.name);
    }
    async logout(refreshToken) {
        await this.prisma.refreshToken.deleteMany({
            where: { token: refreshToken },
        });
    }
    async logoutAll(userId) {
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });
    }
    async getUserById(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                givenName: true,
                familyName: true,
                picture: true,
                createdAt: true,
                lastLoginAt: true,
            },
        });
    }
    getAccessTokenExpiresIn() {
        const expiresIn = this.configService.get('JWT_EXPIRES_IN', '15m');
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (!match)
            return 900;
        const value = parseInt(match[1], 10);
        const unit = match[2];
        switch (unit) {
            case 's': return value;
            case 'm': return value * 60;
            case 'h': return value * 3600;
            case 'd': return value * 86400;
            default: return 900;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map