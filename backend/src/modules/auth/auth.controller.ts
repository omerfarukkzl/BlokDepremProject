import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService, AuthResponse } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { OfficialRole } from '../../entities/official.entity';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<ApiResponse<AuthResponse>> {
    const data = await this.authService.register(registerDto);
    return { success: true, data };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<AuthResponse>> {
    const data = await this.authService.login(loginDto);
    return { success: true, data };
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt'))
  async refreshToken(@Req() req: { user: { userId?: number; sub?: number } }): Promise<ApiResponse<{ token: string }>> {
    const userId = req.user.userId || req.user.sub;
    const data = await this.authService.refreshToken(userId!);
    return { success: true, data };
  }

  @Post('logout')
  async logout(): Promise<ApiResponse<{ message: string }>> {
    const data = await this.authService.logout();
    return { success: true, data };
  }

  @Get('verify/:walletAddress')
  async verifyWallet(
    @Param('walletAddress') walletAddress: string
  ): Promise<ApiResponse<{ isRegistered: boolean }>> {
    const data = await this.authService.verifyWallet(walletAddress);
    return { success: true, data };
  }

  @Get('admin/test')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(OfficialRole.ADMIN)
  async adminTest(
    @Req() req: { user: { userId: number } }
  ): Promise<ApiResponse<{ message: string; userId: number }>> {
    return {
      success: true,
      data: { message: 'Admin access granted', userId: req.user.userId },
      timestamp: new Date().toISOString(),
    };
  }
}

