import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { JwtPayload } from '../types/jwt-payload.type.js';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    const bearerToken = request.headers.authorization
      ?.replace('Bearer ', '')
      .trim();

    const cookieToken = request.cookies?.accessToken;

    const accessToken = bearerToken || cookieToken;

    if (!accessToken) {
      throw new UnauthorizedException(
        'توکن دسترسی ارسال نشده است',
      );
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(
          accessToken,
          {
            secret: this.configService.getOrThrow<string>(
              'JWT_ACCESS_SECRET',
            ),
          },
        );

      request.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException(
        'توکن دسترسی نامعتبر یا منقضی شده است',
      );
    }
  }
}
