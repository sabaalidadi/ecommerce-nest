import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RateLimit } from './entities/rate-limit.entity.js';

@Injectable()
export class RateLimitService {
  private readonly MAX_REQUESTS = 100; // حداکثر مجاز در هر پنجره
  private readonly WINDOW_MS = 60 * 1000; // ۶۰ ثانیه به میلی‌ثانیه
  private readonly BLOCK_DURATION_MS = 1 * 60 * 1000; // مسدودی به مدت ۱ دقیقه

  constructor(
    @InjectRepository(RateLimit)
    private readonly rateLimitRepository: Repository<RateLimit>,
  ) {}

  async checkRateLimit(ip: string): Promise<boolean> {
    const now = new Date();
    const nowMs = now.getTime(); // زمان فعلی به صورت میلی‌ثانیه

    let record = await this.rateLimitRepository.findOne({ where: { ip } });

    // اگر اولین بار است که این IP درخواست می‌زند
    if (!record) {
      record = this.rateLimitRepository.create({
        ip,
        requestCount: 1,
        isBlocked: false,
        blockedUntil: null,
        lastRequestAt: now,
      });
      await this.rateLimitRepository.save(record);
      return true;
    }

    // بررسی آیا مسدود است یا خیر
    if (record.isBlocked) {
      // تبدیل تاریخ پایگاه داده به میلی‌ثانیه برای مقایسه دقیق
      const blockedUntilMs = record.blockedUntil 
        ? new Date(record.blockedUntil).getTime() 
        : 0;

      // اگر مدت مسدودیت تمام شده، رفع بلاک شود
      if (blockedUntilMs && nowMs > blockedUntilMs) {
        record.isBlocked = false;
        record.blockedUntil = null;
        record.requestCount = 1;
        record.lastRequestAt = now;
        await this.rateLimitRepository.save(record);
        return true;
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'آدرس IP شما به دلیل عبور از حد مجاز مسدود شده است.',
          blockedUntil: record.blockedUntil,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // محاسبه زمان سپری شده از آخرین درخواست
    const lastRequestMs = record.lastRequestAt 
      ? new Date(record.lastRequestAt).getTime() 
      : nowMs;
    const elapsedMs = nowMs - lastRequestMs;

    if (elapsedMs > this.WINDOW_MS) {
      // پنجره زمانی گذشته است؛ شمارنده از نو شروع می‌شود
      record.requestCount = 1;
      record.lastRequestAt = now;
    } else {
      // هنوز در بازه زمانی جاری هستیم
      record.requestCount += 1;
      record.lastRequestAt = now;

      // اگر سقف را رد کرد، مسدود شود
      if (record.requestCount > this.MAX_REQUESTS) {
        record.isBlocked = true;
        // ثبت زمان مسدودی به صورت Date جدید
        record.blockedUntil = new Date(nowMs + this.BLOCK_DURATION_MS);
        await this.rateLimitRepository.save(record);

        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'تعداد درخواست‌های شما بیش از حد مجاز بوده و IP شما موقتاً مسدود گردید.',
            blockedUntil: record.blockedUntil,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    await this.rateLimitRepository.save(record);
    return true;
  }
}
