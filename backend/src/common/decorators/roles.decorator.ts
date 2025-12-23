import { SetMetadata } from '@nestjs/common';
import { OfficialRole } from '../../entities/official.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: OfficialRole[]) => SetMetadata(ROLES_KEY, roles);
