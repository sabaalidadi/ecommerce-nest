// src/auth/guards/roles.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js'; // یا مسیر مربوط به دکوراتور نقش‌ها

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // اگر برای این روت هیچ نقشی تعریف نشده بود، دسترسی مجاز است
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // بررسی تطابق حداقل یکی از نقش‌های کاربر با نقش‌های مورد نیاز
    const hasRole = user?.roles?.some((role: string) =>
      requiredRoles.includes(role),
    );

    if (!hasRole) {
      throw new ForbiddenException('شما دسترسی لازم برای این عملیات را ندارید');
    }

    return true;
  }
}
