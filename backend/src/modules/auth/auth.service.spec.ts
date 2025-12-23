import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Official, OfficialRole } from '../../entities/official.entity';

// Mock ethers.js
jest.mock('ethers', () => ({
  ethers: {
    verifyMessage: jest.fn(),
  },
}));

import { ethers } from 'ethers';

describe('AuthService', () => {
  let service: AuthService;
  let officialRepository: jest.Mocked<Repository<Official>>;
  let jwtService: jest.Mocked<JwtService>;

  const mockOfficial: Partial<Official> = {
    id: 1,
    wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
    name: 'Test Official',
    role: OfficialRole.OFFICIAL,
    location_id: 1,
    created_at: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Official),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    officialRepository = module.get(getRepositoryToken(Official));
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto = {
      wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
      signature: 'mock-signature',
      message: 'Login message',
    };

    it('should successfully login with valid signature', async () => {
      (ethers.verifyMessage as jest.Mock).mockReturnValue(loginDto.wallet_address);
      officialRepository.findOne.mockResolvedValue(mockOfficial as Official);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.walletAddress).toBe(mockOfficial.wallet_address);
    });

    it('should throw BadRequestException for invalid signature', async () => {
      (ethers.verifyMessage as jest.Mock).mockReturnValue('0xdifferentaddress');

      await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException for unregistered wallet', async () => {
      (ethers.verifyMessage as jest.Mock).mockReturnValue(loginDto.wallet_address);
      officialRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should normalize wallet address to lowercase', async () => {
      const upperCaseDto = {
        ...loginDto,
        wallet_address: '0x1234567890ABCDEF1234567890ABCDEF12345678',
      };
      (ethers.verifyMessage as jest.Mock).mockReturnValue(
        '0x1234567890abcdef1234567890abcdef12345678'
      );
      officialRepository.findOne.mockResolvedValue(mockOfficial as Official);

      await service.login(upperCaseDto);

      expect(officialRepository.findOne).toHaveBeenCalledWith({
        where: { wallet_address: upperCaseDto.wallet_address.toLowerCase() },
      });
    });

    it('should include role claim in JWT payload', async () => {
      (ethers.verifyMessage as jest.Mock).mockReturnValue(loginDto.wallet_address);
      officialRepository.findOne.mockResolvedValue(mockOfficial as Official);

      await service.login(loginDto);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockOfficial.id,
        walletAddress: mockOfficial.wallet_address,
        role: mockOfficial.role,
      });
    });

    it('should return user with correct role in response', async () => {
      (ethers.verifyMessage as jest.Mock).mockReturnValue(loginDto.wallet_address);
      officialRepository.findOne.mockResolvedValue(mockOfficial as Official);

      const result = await service.login(loginDto);

      expect(result.user.role).toBe(OfficialRole.OFFICIAL);
    });
  });

  describe('register', () => {
    const registerDto = {
      wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
      signature: 'mock-signature',
      message: 'Register message',
      name: 'New Official',
      email: 'test@example.com',
      location_id: 1,
    };

    it('should successfully register new official', async () => {
      (ethers.verifyMessage as jest.Mock).mockReturnValue(registerDto.wallet_address);
      officialRepository.findOne.mockResolvedValue(null);
      officialRepository.create.mockReturnValue(mockOfficial as Official);
      officialRepository.save.mockResolvedValue(mockOfficial as Official);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(officialRepository.create).toHaveBeenCalled();
      expect(officialRepository.save).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for duplicate wallet', async () => {
      (ethers.verifyMessage as jest.Mock).mockReturnValue(registerDto.wallet_address);
      officialRepository.findOne.mockResolvedValue(mockOfficial as Official);

      await expect(service.register(registerDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException for invalid signature', async () => {
      (ethers.verifyMessage as jest.Mock).mockReturnValue('0xwrongaddress');

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyWallet', () => {
    it('should return isRegistered true for existing wallet', async () => {
      officialRepository.findOne.mockResolvedValue(mockOfficial as Official);

      const result = await service.verifyWallet(mockOfficial.wallet_address!);

      expect(result.isRegistered).toBe(true);
    });

    it('should return isRegistered false for non-existing wallet', async () => {
      officialRepository.findOne.mockResolvedValue(null);

      const result = await service.verifyWallet('0xnonexistent');

      expect(result.isRegistered).toBe(false);
    });
  });

  describe('refreshToken', () => {
    it('should return new token for valid user', async () => {
      officialRepository.findOne.mockResolvedValue(mockOfficial as Official);

      const result = await service.refreshToken(1);

      expect(result.token).toBe('mock-jwt-token');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockOfficial.id,
        walletAddress: mockOfficial.wallet_address,
        role: mockOfficial.role,
      });
    });

    it('should throw UnauthorizedException for invalid user', async () => {
      officialRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshToken(999)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should return success message', async () => {
      const result = await service.logout();

      expect(result.message).toBe('Logged out successfully');
    });
  });
});