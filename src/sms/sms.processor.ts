import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SmsJobData } from './interfaces/sms-job.interface.js';

@Processor('sms-queue', {
  limiter: {
    max: 1,         // در هر بازه حداکثر ۱ جاب
    duration: 2000, // بازه زمانی ۲ ثانیه (۲۰۰۰ میلی‌ثانیه)
  },
})
export class SmsProcessor extends WorkerHost {
  private readonly logger = new Logger(SmsProcessor.name);

  async process(job: Job<SmsJobData>): Promise<void> {
    const { phoneNumber, message, messageIndex } = job.data;
    const now = new Date().toLocaleTimeString('fa-IR');

    this.logger.log(
      `[${now}] 📩 [Job #${job.id}] Sending SMS (${messageIndex}/10) to ${phoneNumber}: "${message}"`,
    );

    // شبیه‌سازی ارسال سریع
    this.logger.log(`✅ [Job #${job.id}] Sent successfully.`);
  }
}
