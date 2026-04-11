import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../database/schemas/user.schema';

const ROLE_HIERARCHY: Record<string, number> = {
  [UserRole.SUPER_ADMIN]: 4,
  [UserRole.CONTENT_ADMIN]: 3,
  [UserRole.PRO]: 2,
  [UserRole.FREE]: 1,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    const userLevel = ROLE_HIERARCHY[user.role] || 0;
    // User can access if their role level >= the minimum required role level
    const minRequired = Math.min(...requiredRoles.map((r) => ROLE_HIERARCHY[r] || 0));

    return userLevel >= minRequired;
  }
}
