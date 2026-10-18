import { Controller, Post, Get, Body, Query, UseInterceptors } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { RequestPaymentDto } from './dto/request-payment.dto.js';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('request')
  async requestPayment(@Body() dto: RequestPaymentDto) {
    return await this.paymentsService.requestPayment(dto.orderId);
  }

  @Get('callback')
  async paymentCallback(
    @Query('trackId') trackId: string,
    @Query('success') success: string,
    @Query('status') status: string,
  ) {
    const result = await this.paymentsService.verifyPayment(trackId, success, status);
    // با JSON.parse(JSON.stringify(...)) مطمئن می‌شویم داده کاملاً آبجکت خام است
    return result;
  }
}
