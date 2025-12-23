import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Reflector } from '@nestjs/core';
import { OfficialRole } from '../../entities/official.entity';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn(),
            verifyWallet: jest.fn(),
          },
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('adminTest', () => {
    it('should return success response for admin user (AC #1)', async () => {
      const mockReq = {
        user: {
          userId: 1,
          walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
          role: OfficialRole.ADMIN,
        },
      };

      const result = await controller.adminTest(mockReq);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        message: 'Admin access granted',
        userId: 1,
      });
      expect(result.timestamp).toBeDefined();
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should include timestamp in ISO format', async () => {
      const mockReq = {
        user: {
          userId: 1,
          role: OfficialRole.ADMIN,
        },
      };

      const result = await controller.adminTest(mockReq);

      expect(result.timestamp).toBeDefined();
      // ISO format validation
      expect(new Date(result.timestamp!).toISOString()).toBe(result.timestamp);
    });
  });
});