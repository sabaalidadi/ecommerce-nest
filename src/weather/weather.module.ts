import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller.js';
import { WeatherService } from './weather.service.js';
import { RedisModule } from '../redis/redis.module.js';

@Module({
  imports: [RedisModule],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}
