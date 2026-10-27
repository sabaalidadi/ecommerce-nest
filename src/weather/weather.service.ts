import {
  Inject,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {Redis} from 'ioredis';
import axios from 'axios';
import { REDIS_CLIENT } from '../redis/redis.constants.js';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly CACHE_TTL_SECONDS = 900; // ۱۵ دقیقه انقضا در ردیس

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async getWeather(city: string) {
    const normalizedCity = city.trim().toLowerCase();
    const cacheKey = `weather:${normalizedCity}`;

    // ۱. بررسی کش در ردیس
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      this.logger.log(`⚡️ داده‌های آب‌وهوای شهر ${normalizedCity} از Redis (Cache Hit) خوانده شد.`);
      return {
        source: 'redis_cache',
        ...JSON.parse(cachedData),
      };
    }

    // ۲. در صورت نبودن در کش، واکشی از API خارجی
    this.logger.log(`🌐 در حال استعلام آب‌وهوای ${normalizedCity} از API هواشناسی (Cache Miss)...`);
    const weatherData = await this.fetchFromWeatherApi(normalizedCity);

    // ۳. ذخیره سازی نتیجه در ردیس همراه با TTL
    await this.redis.set(
      cacheKey,
      JSON.stringify(weatherData),
      'EX',
      this.CACHE_TTL_SECONDS,
    );

    return {
      source: 'live_api',
      ...weatherData,
    };
  }

  private async fetchFromWeatherApi(cityName: string) {
    try {
      // الف: تبدیل نام شهر به مختصات جغرافیایی (Geocoding رایگان بدون نیاز به کلید)
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        cityName,
      )}&count=1&language=en&format=json`;

      const geoRes = await axios.get(geoUrl);

      if (!geoRes.data.results || geoRes.data.results.length === 0) {
        throw new NotFoundException(`شهری با نام "${cityName}" پیدا نشد`);
      }

      const location = geoRes.data.results[0];
      const { latitude, longitude, name, country } = location;

      // ب: دریافت آب‌وهوای فعلی بر اساس مختصات
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code`;
      const weatherRes = await axios.get(weatherUrl);

      const current = weatherRes.data.current;

      return {
        city: name,
        country: country,
        temperature: `${current.temperature_2m} °C`,
        feelsLike: `${current.apparent_temperature} °C`,
        humidity: `${current.relative_humidity_2m} %`,
        windSpeed: `${current.wind_speed_10m} km/h`,
        weatherCondition: this.mapWeatherCode(current.weather_code),
        cachedAt: new Date().toISOString(),
      };
        } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`خطا در ارتباط با API هواشناسی: ${errorMessage}`);
      throw new InternalServerErrorException(
        'خطا در برقراری ارتباط با سرویس هواشناسی',
      );
    }
  }

  // مپ کردن کد استاندارد WMO به وضعیت متنی
  private mapWeatherCode(code: number): string {
    if (code === 0) return 'آسمان کاملاً صاف ☀️';
    if ([1, 2, 3].includes(code)) return 'کمی ابری تا نیمه‌ابری ⛅';
    if ([45, 48].includes(code)) return 'مه‌آلود 🌫️';
    if ([51, 53, 55, 61, 63, 65].includes(code)) return 'بارانی 🌧️';
    if ([71, 73, 75, 77].includes(code)) return 'برفی ❄️';
    if ([80, 81, 82].includes(code)) return 'رگبار باران 🌦️';
    if ([95, 96, 99].includes(code)) return 'رعد و برق ⛈️';
    return 'معمولی';
  }

  // متد تست قبلی
  async testRedis() {
    await this.redis.set('weather:test', 'ok', 'EX', 60);
    const value = await this.redis.get('weather:test');
    return {
      ping: await this.redis.ping(),
      cachedValue: value,
    };
  }
}
