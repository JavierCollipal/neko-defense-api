// 🐾👑 NEKO DEFENSE - Roles Decorator 👑🐾
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * 👑 Roles decorator for role-based access control
 * Usage: @Roles('admin', 'moderator')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
