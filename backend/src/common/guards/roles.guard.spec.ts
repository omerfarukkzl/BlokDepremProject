import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { OfficialRole } from '../../entities/official.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    const mockExecutionContext = (userRole: OfficialRole): ExecutionContext => {
        const mockRequest = {
            user: {
                userId: 1,
                walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
                role: userRole,
            },
        };

        return {
            switchToHttp: () => ({
                getRequest: () => mockRequest,
            }),
            getHandler: () => jest.fn(),
            getClass: () => jest.fn(),
        } as unknown as ExecutionContext;
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [RolesGuard, Reflector],
        }).compile();

        guard = module.get<RolesGuard>(RolesGuard);
        reflector = module.get<Reflector>(Reflector);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate', () => {
        it('should return true when user has admin role and admin is required', () => {
            jest
                .spyOn(reflector, 'getAllAndOverride')
                .mockReturnValue([OfficialRole.ADMIN]);

            const context = mockExecutionContext(OfficialRole.ADMIN);
            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should throw ForbiddenException when user has official role but admin is required', () => {
            jest
                .spyOn(reflector, 'getAllAndOverride')
                .mockReturnValue([OfficialRole.ADMIN]);

            const context = mockExecutionContext(OfficialRole.OFFICIAL);

            expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        });

        it('should return true when no roles are required (no @Roles decorator)', () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

            const context = mockExecutionContext(OfficialRole.OFFICIAL);
            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should throw ForbiddenException with standard error format', () => {
            jest
                .spyOn(reflector, 'getAllAndOverride')
                .mockReturnValue([OfficialRole.ADMIN]);

            const context = mockExecutionContext(OfficialRole.OFFICIAL);

            try {
                guard.canActivate(context);
                fail('Expected ForbiddenException to be thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(ForbiddenException);
                const response = error.getResponse();
                expect(response).toHaveProperty('success', false);
                expect(response).toHaveProperty('error');
                expect(response.error).toHaveProperty('code', 'FORBIDDEN');
                expect(response.error).toHaveProperty('message', 'Admin access required');
                expect(response).toHaveProperty('timestamp');
            }
        });

        it('should allow access when user role matches any of the required roles', () => {
            jest
                .spyOn(reflector, 'getAllAndOverride')
                .mockReturnValue([OfficialRole.ADMIN, OfficialRole.OFFICIAL]);

            const context = mockExecutionContext(OfficialRole.OFFICIAL);
            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });
    });
});
