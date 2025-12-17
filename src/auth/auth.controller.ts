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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    const user = await this.authService.getUserById(req.user.sub);
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
    await this.authService.logoutAll(req.user.sub);
    return {
      success: true,
      message: 'Logged out from all devices',
    };
  }
}
