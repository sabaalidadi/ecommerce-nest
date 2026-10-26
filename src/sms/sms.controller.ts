import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { SmsService } from './sms.service.js';

@ApiTags('SMS Queue')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send-bulk-simulation')
  @ApiOperation({ summary: 'ارسال تست ۱۰ پیامک به صف برای پردازش هر ۲ ثانیه یک‌بار' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phoneNumber: { type: 'string', example: '09123456789' },
      },
    },
  })
  async sendBulkSimulation(@Body('phoneNumber') phoneNumber?: string) {
    const phone = phoneNumber || '09120000000';
    return this.smsService.queueBulkSmsSimulation(phone);
  }
}
