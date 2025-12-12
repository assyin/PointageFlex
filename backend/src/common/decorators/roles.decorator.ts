import { SetMetadata } from '@nestjs/common';
import { LegacyRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: LegacyRole[]) => SetMetadata(ROLES_KEY, roles);
