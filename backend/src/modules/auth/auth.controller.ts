import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService, AuthResponse } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<ApiResponse<AuthResponse>> {
    try {
      const data = await this.authService.register(registerDto);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<AuthResponse>> {
    try {
      const data = await this.authService.login(loginDto);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt'))
  async refreshToken(@Req() req): Promise<ApiResponse<{ token: string }>> {
    try {
      const userId = req.user.userId || req.user.sub;
      const data = await this.authService.refreshToken(userId);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('logout')
  async logout(): Promise<ApiResponse<{ message: string }>> {
    try {
      const data = await this.authService.logout();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('verify/:walletAddress')
  async verifyWallet(
    @Param('walletAddress') walletAddress: string
  ): Promise<ApiResponse<{ isRegistered: boolean }>> {
    try {
      const data = await this.authService.verifyWallet(walletAddress);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
