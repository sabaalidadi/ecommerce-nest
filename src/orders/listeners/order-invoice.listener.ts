import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderCreatedEvent } from '../events/order-created.event.js';

@Injectable()
export class OrderInvoiceListener {
  private readonly logger = new Logger('InvoiceService');

  @OnEvent('order.created')
  handleOrderCreatedEvent(event: OrderCreatedEvent) {
    const { order } = event;

    this.logger.log('================== 🧾 صدور فاکتور جدید (تستی) ==================');
    this.logger.log(`شماره فاکتور: ${order.id}`);
    this.logger.log(`مشتری: ${order.user?.fullName || 'نامشخص'} (${order.user?.phoneNumber || order.userId})`);
    this.logger.log(`آدرس تحویل: ${order.address?.city || ''} - ${order.address?.postalAddress || 'ثبت شده'}`);
    this.logger.log(`تاریخ ثبت: ${new Date(order.setTime).toLocaleString('fa-IR')}`);
    this.logger.log('------------------------- اقلام سفارش -------------------------');

    if (order.items && order.items.length > 0) {
      order.items.forEach((item, index) => {
        this.logger.log(
          `  ${index + 1}. محصول: ${item.product?.title || item.productId} | فی: ${Number(item.price).toLocaleString()} تومان`,
        );
      });
    }

    this.logger.log('---------------------------------------------------------------');
    this.logger.log(`مبلغ کل فاکتور: ${Number(order.totalPrice).toLocaleString()} تومان`);
    this.logger.log(`وضعیت سفارش: ${order.status}`);
    this.logger.log('===============================================================');
  }
}
