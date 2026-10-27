import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service.js';
import { GetWeatherDto } from './dto/get-weather.dto.js';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  getWeather(@Query() query: GetWeatherDto) {
    return this.weatherService.getWeather(query.city);
  }

  @Get('redis-test')
  testRedis() {
    return this.weatherService.testRedis();
  }
}
