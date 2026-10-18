import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Order } from '../orders/entities/order.entity.js';
import { OrderStatus } from '../orders/enums/order-status.enum.js';

@Injectable()
export class PaymentsService {
  private readonly ZIBAL_SANDBOX_MERCHANT = 'zibal'; // مرچنت تست زیبال

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  // ۱. درخواست ایجاد تراکنش به زیبال
  async requestPayment(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: { user: true },
    });

    if (!order) {
      throw new NotFoundException('سفارش مورد نظر یافت نشد');
    }

    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('این سفارش قبلاً پرداخت شده است');
    }

    // مبلغ در زیبال بر اساس ریال است (مبلغ کل سفارش در 10 ضرب می‌شود)
    const amountInRials = Number(order.totalPrice) * 10;

    try {
      const response = await axios.post('https://gateway.zibal.ir/v1/request', {
        merchant: this.ZIBAL_SANDBOX_MERCHANT,
        amount: amountInRials,
        callbackUrl: 'http://localhost:3000/api/payments/callback',
        orderId: order.id,
        mobile: order.user?.phoneNumber || '09123456789',
      });

      const data = response.data;

      if (data.result === 100) {
        return {
          trackId: data.trackId,
          paymentUrl: `https://gateway.zibal.ir/start/${data.trackId}`,
        };
      } else {
        throw new BadRequestException(`خطا در ارتباط با درگاه زیبال: کد ${data.result}`);
      }
    } catch (error) {
      throw new InternalServerErrorException('خطای سیستمی در اتصال به درگاه پرداخت');
    }
  }

  // ۲. تایید پرداخت (Callback) پس از بازگشت از بانک
  async verifyPayment(trackId: string, success: string, status: string) {
    if (success !== '1' || status !== '2') {
      return {
        status: 'FAILED',
        message: 'پرداخت توسط کاربر لغو شد یا با خطا مواجه گردید.',
      };
    }

    try {
      const response = await axios.post('https://gateway.zibal.ir/v1/verify', {
        merchant: this.ZIBAL_SANDBOX_MERCHANT,
        trackId: Number(trackId),
      });

      const data = response.data;

      if (data.result === 100) {
        // پرداخت موفقیت‌آمیز بوده است؛ پیدا کردن سفارش با orderId برگشتی از زیبال
        const orderId = data.orderId;
        const order = await this.orderRepository.findOne({ where: { id: orderId } });

        if (order && order.status !== OrderStatus.PAID) {
          order.status = OrderStatus.PAID;
          order.payedTime = new Date();
          await this.orderRepository.save(order);
        }

        return {
          status: 'SUCCESS',
          message: 'پرداخت با موفقیت انجام شد و سفارش تایید گردید.',
          refNumber: data.refNumber,
          amount: data.amount,
          orderId: data.orderId,
        };
      } else {
        return {
          status: 'FAILED',
          message: `تایید پرداخت ناموفق بود. کد خطا: ${data.result}`,
        };
      }
    } catch (error) {
      throw new InternalServerErrorException('خطا در تایید تراکنش با درگاه پرداخت');
    }
  }
}
