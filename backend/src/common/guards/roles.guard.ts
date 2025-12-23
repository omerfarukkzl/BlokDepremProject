import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OfficialRole } from '../../entities/official.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<OfficialRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        // No @Roles() decorator = allow all authenticated users
        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        const hasRole = requiredRoles.some((role) => user.role === role);

        if (!hasRole) {
            throw new ForbiddenException({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Admin access required' },
                timestamp: new Date().toISOString(),
            });
        }

        return true;
    }
}
