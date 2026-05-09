/**
 * Auth Controller
 * 
 * REST API endpoints for authentication.
 */

import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Auth0AuthDto } from './dto/auth0-auth.dto';
import { MidwifeLoginDto } from './dto/midwife-login.dto';
import { MidwifeProvisionDto } from './dto/midwife-provision.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Authenticate with Auth0 token
   * POST /auth/auth0
   */
  @Post('auth0')
  @HttpCode(HttpStatus.OK)
  async auth0Auth(@Body() dto: Auth0AuthDto) {
    const result = await this.authService.auth0Auth(dto);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Authenticate with Google ID token
   * POST /auth/google
   */
  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth(@Body() dto: GoogleAuthDto) {
    const tokens = await this.authService.googleAuth(dto);
    return {
      success: true,
      data: tokens,
    };
  }

  /**
   * Authenticate midwife with email/password
   * POST /auth/midwife/login
   */
  @Post('midwife/login')
  @HttpCode(HttpStatus.OK)
  async midwifeLogin(@Body() dto: MidwifeLoginDto) {
    const result = await this.authService.midwifeLogin(dto);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Change midwife password
   * POST /auth/midwife/change-password
   */
  @Post('midwife/change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    if (req.user?.actorType !== 'midwife') {
      throw new ForbiddenException('Midwife access required');
    }

    await this.authService.changeMidwifePassword(req.user.sub, dto);
    return {
      success: true,
      message: 'Password updated successfully',
    };
  }

  /**
   * Admin-only: Provision midwife account
   * POST /auth/midwife/provision
   */
  @Post('midwife/provision')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async provisionMidwife(@Request() req, @Body() dto: MidwifeProvisionDto) {
    if (req.user?.actorType !== 'midwife' || req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    const result = await this.authService.createMidwifeAccount(dto);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Admin-only: List midwives
   * GET /auth/midwives
   */
  @Get('midwives')
  @UseGuards(JwtAuthGuard)
  async listMidwives(@Request() req) {
    if (req.user?.actorType !== 'midwife' || req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    const result = await this.authService.listMidwives();
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenDto) {
    const tokens = await this.authService.refreshTokens(dto.refreshToken);
    return {
      success: true,
      data: tokens,
    };
  }

  /**
   * Get current user profile
   * GET /auth/me
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const actorType = req.user.actorType || 'user';
    const user = await this.authService.getActorById(req.user.sub, actorType);
    return {
      success: true,
      data: user,
    };
  }

  /**
   * Logout (invalidate refresh token)
   * POST /auth/logout
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Body() dto: RefreshTokenDto) {
    await this.authService.logout(dto.refreshToken);
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  /**
   * Logout from all devices
   * POST /auth/logout-all
   */
  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(@Request() req) {
    const actorType = req.user.actorType || 'user';
    await this.authService.logoutAll(req.user.sub, actorType);
    return {
      success: true,
      message: 'Logged out from all devices',
    };
  }
}
