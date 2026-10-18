import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service.js';
import { PaymentsController } from './payments.controller.js';
import { Order } from '../orders/entities/order.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
