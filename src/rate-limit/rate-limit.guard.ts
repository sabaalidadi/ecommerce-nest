import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { RateLimitService } from './rate-limit.service.js';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly rateLimitService: RateLimitService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // استخراج IP کلاینت (پشتیبانی از هر دو حالت عادی و پشت Proxy / Nginx)
    const forwarded = request.headers['x-forwarded-for'];
    let clientIp = '';

    if (typeof forwarded === 'string') {
      clientIp = forwarded.split(',')[0].trim();
    } else if (Array.isArray(forwarded)) {
      clientIp = forwarded[0].trim();
    } else {
      clientIp = request.ip || request.socket.remoteAddress || '127.0.0.1';
    }

    // اجرای اعتبارسنجی و ثبت در دیتابیس
    return await this.rateLimitService.checkRateLimit(clientIp);
  }
}
