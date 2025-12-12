import { LegacyRole } from '@prisma/client';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: LegacyRole[]) => import("@nestjs/common").CustomDecorator<string>;
