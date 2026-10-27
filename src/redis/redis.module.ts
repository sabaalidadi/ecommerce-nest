import { Module } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis.constants.js';

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        // Laragon default: 6379
        return new Redis({
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: Number(process.env.REDIS_PORT || 6379),
        });
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
