import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SmsService } from './sms.service.js';
import { SmsProcessor } from './sms.processor.js';
import { SmsController } from './sms.controller.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'sms-queue',
    }),
  ],
  controllers: [SmsController],
  providers: [SmsService, SmsProcessor],
  exports: [SmsService],
})
export class SmsModule {}
