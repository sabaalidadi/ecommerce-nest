import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { RateLimit } from './entities/rate-limit.entity.js';
import { RateLimitService } from './rate-limit.service.js';
import { RateLimitGuard } from './rate-limit.guard.js';

@Module({
  imports: [TypeOrmModule.forFeature([RateLimit])],
  providers: [
    RateLimitService,
    // ثبت به عنوان گارد سراسری در کل پروژه
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
  exports: [RateLimitService],
})
export class RateLimitModule {}
