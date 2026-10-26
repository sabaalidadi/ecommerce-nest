import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SmsJobData } from './interfaces/sms-job.interface.js';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    @InjectQueue('sms-queue') private readonly smsQueue: Queue<SmsJobData>,
  ) {}

  async queueBulkSmsSimulation(targetPhoneNumber: string): Promise<{ message: string; count: number }> {
    const jobs = Array.from({ length: 10 }, (_, index) => {
      const messageIndex = index + 1;
      return {
        name: 'send-sms',
        data: {
          phoneNumber: targetPhoneNumber,
          message: `کد تایید یا پیام اطلاع‌رسانی شماره ${messageIndex}`,
          messageIndex,
        },
        opts: {
          removeOnComplete: true, // پاکسازی جاب‌های موفق از ردیس
          removeOnFail: false,
        },
      };
    });

    // افزودن یک‌باره ۱۰ پیامک به صف (Bulk Add)
    await this.smsQueue.addBulk(jobs);

    this.logger.log(`🚀 10 SMS jobs were enqueued successfully for ${targetPhoneNumber}`);

    return {
      message: '10 SMS jobs have been enqueued and will be sent 1 by 1 every 2 seconds.',
      count: 10,
    };
  }
}
