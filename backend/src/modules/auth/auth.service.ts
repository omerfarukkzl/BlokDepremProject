import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import { Official } from '../../entities/official.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface UserResponse {
  id: string;
  walletAddress: string;
  name: string;
  email?: string;
  role: 'admin' | 'official' | 'donor';
  locationId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Official)
    private readonly officialRepository: Repository<Official>,
    private readonly jwtService: JwtService,
  ) { }

  /**
   * Verify wallet signature using ethers.js
   */
  private verifySignature(walletAddress: string, message: string, signature: string): boolean {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Transform Official entity to UserResponse
   */
  private toUserResponse(official: Official): UserResponse {
    return {
      id: official.id.toString(),
      walletAddress: official.wallet_address,
      name: official.name || '',
      role: 'official',
      locationId: official.location_id?.toString(),
      isActive: true,
      createdAt: official.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: official.created_at?.toISOString() || new Date().toISOString(),
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { wallet_address, signature, message, name, email, location_id } = registerDto;

    // Verify signature
    if (!this.verifySignature(wallet_address, message, signature)) {
      throw new BadRequestException('Invalid signature');
    }

    // Check if official already exists
    const existingOfficial = await this.officialRepository.findOne({
      where: { wallet_address: wallet_address.toLowerCase() }
    });

    if (existingOfficial) {
      throw new UnauthorizedException('Official with this wallet address already exists');
    }

    // Create new official
    const official = this.officialRepository.create({
      wallet_address: wallet_address.toLowerCase(),
      name,
      location_id
    });
    const savedOfficial = await this.officialRepository.save(official);

    // Generate JWT token
    const payload = { sub: savedOfficial.id, walletAddress: savedOfficial.wallet_address };
    const token = this.jwtService.sign(payload);

    return {
      user: this.toUserResponse(savedOfficial),
      token,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { wallet_address, signature, message } = loginDto;

    // Verify signature
    if (!this.verifySignature(wallet_address, message, signature)) {
      throw new BadRequestException('Invalid signature');
    }

    // Find official
    const official = await this.officialRepository.findOne({
      where: { wallet_address: wallet_address.toLowerCase() }
    });

    if (!official) {
      throw new UnauthorizedException('Wallet not registered. Please register first.');
    }

    // Generate JWT token
    const payload = { sub: official.id, walletAddress: official.wallet_address };
    const token = this.jwtService.sign(payload);

    return {
      user: this.toUserResponse(official),
      token,
    };
  }

  async refreshToken(userId: number): Promise<{ token: string }> {
    const official = await this.officialRepository.findOne({ where: { id: userId } });

    if (!official) {
      throw new UnauthorizedException('User not found');
    }

    const payload = { sub: official.id, walletAddress: official.wallet_address };
    const token = this.jwtService.sign(payload);

    return { token };
  }

  async verifyWallet(walletAddress: string): Promise<{ isRegistered: boolean }> {
    const official = await this.officialRepository.findOne({
      where: { wallet_address: walletAddress.toLowerCase() }
    });

    return { isRegistered: !!official };
  }

  async logout(): Promise<{ message: string }> {
    // JWT tokens are stateless, so we just return success
    // In a production app, you might want to blacklist the token
    return { message: 'Logged out successfully' };
  }
}
