import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { META_PERMISSIONS } from '../constants/metadata-keys.js';
import { IS_PUBLIC_KEY } from '../constants/metadata-keys.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // اگر روت Public بود، عبور کن
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // گرفتن پرمیشن‌های مورد نیاز این متد/کنترلر
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      META_PERMISSIONS,
      [context.getHandler(), context.getClass()],
    );

    // اگر پرمیشنی مشخص نشده بود، صرفاً لاگین بودن کافیست
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.permissions) {
      throw new ForbiddenException('شما دسترسی لازم برای این عملیات را ندارید');
    }

    // بررسی اینکه آیا کاربر تمام پرمیشن‌های مورد نیاز را دارد یا خیر
    const hasAllPermissions = requiredPermissions.every((perm) =>
      user.permissions.includes(perm),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('شما دسترسی لازم برای این عملیات را ندارید');
    }

    return true;
  }
}
