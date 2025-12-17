/**
 * Auth Service
 * 
 * Service for handling Google OAuth authentication and JWT token management.
 */

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { v4 as uuidv4 } from 'uuid';

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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  /**
   * Authenticate user with Google token (ID token or authorization code)
   */
  async googleAuth(dto: GoogleAuthDto): Promise<AuthTokens> {
    let googleUser: GoogleUserInfo;

    if (dto.code) {
      // Exchange authorization code for tokens
      this.logger.log('Exchanging authorization code for tokens...');
      googleUser = await this.exchangeCodeForUserInfo(dto.code, dto.redirectUri);
    } else if (dto.idToken) {
      // Verify ID token directly
      this.logger.log('Verifying ID token...');
      googleUser = await this.verifyGoogleToken(dto.idToken);
    } else {
      throw new UnauthorizedException('Either idToken or code is required');
    }

    const user = await this.findOrCreateUser(googleUser);
    
    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateTokens(user.id, user.email, user.name);
  }

  /**
   * Exchange authorization code for user info
   */
  private async exchangeCodeForUserInfo(code: string, redirectUri?: string): Promise<GoogleUserInfo> {
    try {
      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

      if (!clientId || !clientSecret) {
        throw new Error('Google OAuth credentials not configured');
      }

      // Exchange code for tokens
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
        throw new UnauthorizedException('Failed to exchange authorization code');
      }

      const tokens = await tokenResponse.json();
      this.logger.log('Token exchange successful');

      // If we got an ID token, verify it
      if (tokens.id_token) {
        return this.verifyGoogleToken(tokens.id_token);
      }

      // Otherwise, use access token to get user info
      if (tokens.access_token) {
        return this.getUserInfoFromAccessToken(tokens.access_token);
      }

      throw new UnauthorizedException('No token received from Google');
    } catch (error) {
      this.logger.error('Code exchange failed', error);
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }

  /**
   * Get user info from access token
   */
  private async getUserInfoFromAccessToken(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
    );
    
    if (!response.ok) {
      throw new UnauthorizedException('Failed to fetch user info');
    }

    const userInfo = await response.json();
    
    if (!userInfo.sub || !userInfo.email) {
      throw new UnauthorizedException('Invalid user info from Google');
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

  /**
   * Verify Google ID token and extract user info
   */
  private async verifyGoogleToken(token: string): Promise<GoogleUserInfo> {
    // First, try to verify as ID token
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
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
    } catch {
      // ID token verification failed, try as access token
      this.logger.debug('ID token verification failed, trying access token');
    }

    // Try to verify as access token by fetching user info
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userInfo = await response.json();
      
      if (!userInfo.sub || !userInfo.email) {
        throw new UnauthorizedException('Invalid Google token payload');
      }

      return {
        googleId: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        givenName: userInfo.given_name,
        familyName: userInfo.family_name,
        picture: userInfo.picture,
      };
    } catch (error) {
      this.logger.error('Google token verification failed', error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  /**
   * Find existing user or create new one
   */
  private async findOrCreateUser(googleUser: GoogleUserInfo) {
    let user = await this.prisma.user.findUnique({
      where: { googleId: googleUser.googleId },
    });

    if (!user) {
      // Check if email already exists (shouldn't happen, but safety check)
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: googleUser.email },
      });

      if (existingEmail) {
        // Link Google account to existing user
        user = await this.prisma.user.update({
          where: { email: googleUser.email },
          data: { googleId: googleUser.googleId },
        });
      } else {
        // Create new user
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
    } else {
      // Update user info from Google
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

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(
    userId: string,
    email: string,
    name?: string | null,
  ): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      name: name ?? undefined,
    };

    const accessToken = this.jwtService.sign(payload);
    
    const refreshToken = uuidv4();
    const refreshExpiresIn = this.configService.get<number>('JWT_REFRESH_EXPIRES_DAYS', 7);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshExpiresIn);

    // Store refresh token
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

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      // Clean up expired token
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    // Delete old refresh token
    await this.prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    // Generate new tokens
    return this.generateTokens(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.name,
    );
  }

  /**
   * Logout - invalidate refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  /**
   * Logout from all devices - invalidate all refresh tokens
   */
  async logoutAll(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
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

  /**
   * Get access token expiration time in seconds
   */
  private getAccessTokenExpiresIn(): number {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '15m');
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    
    if (!match) return 900; // Default 15 minutes
    
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
}
