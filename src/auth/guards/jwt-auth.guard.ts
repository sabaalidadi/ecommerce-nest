import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload } from '../types/jwt-payload.type.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ۱. بررسی تگ @Public روی متد یا روی خود کنترلر
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // اگر عمومی بود، نیازی به توکن نیست
    }

    // ۲. دریافت و اعتبارسنجی توکن
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authHeader = request.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '').trim()
      : undefined;

    const cookieToken = request.cookies?.accessToken;
    const accessToken = bearerToken || cookieToken;

    if (!accessToken) {
      throw new UnauthorizedException('توکن دسترسی ارسال نشده است');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        accessToken,
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        },
      );

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('توکن دسترسی نامعتبر یا منقضی شده است');
    }
  }
}
