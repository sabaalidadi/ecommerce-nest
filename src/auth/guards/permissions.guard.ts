
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator.js';
import { JwtPayload } from '../types/jwt-payload.type.js';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(
        PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const user = request.user;



console.log('USER FROM JWT:', user);
console.log('REQUIRED PERMISSIONS:', requiredPermissions);

    if (!user) {
      throw new ForbiddenException('اطلاعات کاربر یافت نشد');
    }

    const roles = Array.isArray(user.roles) ? user.roles : [];
    const permissions = Array.isArray(user.permissions)
      ? user.permissions
      : [];

    // ادمین باید در توکن نقش admin داشته باشد.
    if (roles.includes('admin')) {
      return true;
    }

    const hasAllPermissions = requiredPermissions.every(
      (permission) => permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        'شما مجوز لازم برای انجام این عملیات را ندارید',
      );
    }

    return true;
  }
}
